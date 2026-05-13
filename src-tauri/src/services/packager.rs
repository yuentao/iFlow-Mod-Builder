use std::fs;
use std::io::{Write, BufWriter};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use crate::error::AppError;
use crate::models::{ModConfig, FileInfo, BuildConfig, BuildResult};

pub struct Packager {
    cancel_flag: Arc<Mutex<bool>>,
}

impl Packager {
    pub fn new() -> Self {
        Self {
            cancel_flag: Arc::new(Mutex::new(false)),
        }
    }

    pub fn set_cancel(&self, cancel: bool) {
        *self.cancel_flag.lock().unwrap() = cancel;
    }

    pub fn build(&self, config: &BuildConfig) -> Result<BuildResult, AppError> {
        // Check cancel flag
        if *self.cancel_flag.lock().unwrap() {
            return Err(AppError::BuildError("打包已取消".to_string()));
        }

        // 1. Validate required files
        self.validate_required_files(&config.mod_path)?;

        // 2. Parse mod.json
        let mod_json = self.parse_mod_json(&config.mod_path)?;

        // 3. Validate required fields
        self.validate_mod_config(&mod_json)?;

        // 4. Collect files
        let files = self.collect_files(&config.mod_path)?;

        // 5. Generate output path
        let output_file = config.file_name.clone();
        let output_dir = PathBuf::from(&config.output_path);
        if !output_dir.exists() {
            fs::create_dir_all(&output_dir)
                .map_err(|e| AppError::BuildError(format!("无法创建输出目录: {}", e)))?;
        }
        let output_path = output_dir.join(&output_file);

        // 6. Create zip
        let file_count = files.len();
        self.create_zip(&files, &output_path, &config.compress_level)?;

        // 7. Validate zip
        if config.validate_after_build {
            self.validate_zip(&output_path)?;
        }

        // 8. Get file size
        let file_size = fs::metadata(&output_path)
            .map(|m| m.len())
            .unwrap_or(0);

        Ok(BuildResult {
            success: true,
            output_path: output_path.to_string_lossy().to_string(),
            file_count: file_count as u32,
            file_size,
            error: None,
        })
    }

    fn validate_required_files(&self, mod_path: &str) -> Result<(), AppError> {
        let path = Path::new(mod_path);
        let required = ["mod.json", "code.js"];

        for file in required.iter() {
            let file_path = path.join(file);
            if !file_path.exists() {
                return Err(AppError::ValidationError(
                    format!("缺少必需文件: {}", file)
                ));
            }
        }
        Ok(())
    }

    fn parse_mod_json(&self, mod_path: &str) -> Result<ModConfig, AppError> {
        let content = fs::read_to_string(Path::new(mod_path).join("mod.json"))
            .map_err(|e| AppError::FileNotFound(format!("无法读取 mod.json: {}", e)))?;
        serde_json::from_str(&content)
            .map_err(|e| AppError::ValidationError(format!("mod.json 格式错误: {}", e)))
    }

    fn validate_mod_config(&self, config: &ModConfig) -> Result<(), AppError> {
        let required_fields = [
            ("id", config.id.is_empty()),
            ("name", config.name.is_empty()),
            ("version", config.version.is_empty()),
            ("type", config.type_field.is_empty()),
        ];

        for (field, is_empty) in required_fields.iter() {
            if *is_empty {
                return Err(AppError::ValidationError(
                    format!("mod.json 缺少必填字段: {}", field)
                ));
            }
        }
        Ok(())
    }

    fn collect_files(&self, mod_path: &str) -> Result<Vec<FileInfo>, AppError> {
        let mut files = Vec::new();
        let path = Path::new(mod_path);

        self.collect_files_recursive(path, path, &mut files)?;

        Ok(files)
    }

    fn collect_files_recursive(
        &self,
        dir: &Path,
        base_dir: &Path,
        files: &mut Vec<FileInfo>,
    ) -> Result<(), AppError> {
        for entry in fs::read_dir(dir).map_err(|e| AppError::IoError(e))? {
            let entry = entry.map_err(|e| AppError::IoError(e))?;
            let file_path = entry.path();
            let file_name = file_path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");

            // Skip .iflow-mod files and hidden files
            if file_name.starts_with('.') || file_name.ends_with(".iflow-mod") {
                continue;
            }

            if file_path.is_dir() {
                self.collect_files_recursive(&file_path, base_dir, files)?;
            } else {
                let relative_path = file_path.strip_prefix(base_dir)
                    .map_err(|e| AppError::BuildError(format!("路径错误: {}", e)))?;
                // Use forward slashes for zip paths
                let relative_str = relative_path.to_string_lossy().replace('\\', "/");
                files.push(FileInfo {
                    full_path: file_path.to_string_lossy().to_string(),
                    relative_path: relative_str,
                });
            }
        }
        Ok(())
    }

    fn create_zip(
        &self,
        files: &[FileInfo],
        output: &Path,
        compress_level: &str,
    ) -> Result<(), AppError> {
        let file = fs::File::create(output)
            .map_err(|e| AppError::BuildError(format!("无法创建输出文件: {}", e)))?;
        let mut writer = BufWriter::new(file);

        let level = match compress_level {
            "fast" => 1,
            "maximum" => 9,
            _ => 6, // standard
        };

        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Deflated)
            .compression_level(Some(level as i64));

        let mut zip_writer = zip::ZipWriter::new(&mut writer);

        for (i, file_info) in files.iter().enumerate() {
            // Check cancel flag
            if *self.cancel_flag.lock().unwrap() {
                return Err(AppError::BuildError("打包已取消".to_string()));
            }

            let data = fs::read(&file_info.full_path)
                .map_err(|e| AppError::BuildError(
                    format!("无法读取文件 {}: {}", file_info.relative_path, e)
                ))?;

            zip_writer.start_file(&file_info.relative_path, options)
                .map_err(|e| AppError::BuildError(
                    format!("无法写入文件 {}: {}", file_info.relative_path, e)
                ))?;

            zip_writer.write_all(&data)
                .map_err(|e| AppError::BuildError(
                    format!("写入数据失败 {}: {}", file_info.relative_path, e)
                ))?;

            let _percent = ((i as f64 + 1.0) / files.len() as f64 * 100.0) as u32;
            // In a real implementation, emit progress event here
        }

        zip_writer.finish()
            .map_err(|e| AppError::BuildError(format!("完成 zip 写入失败: {}", e)))?;

        Ok(())
    }

    fn validate_zip(&self, path: &Path) -> Result<(), AppError> {
        let file = fs::File::open(path)
            .map_err(|e| AppError::BuildError(format!("无法读取 zip 文件: {}", e)))?;

        let mut archive = zip::ZipArchive::new(file)
            .map_err(|e| AppError::BuildError(format!("zip 文件损坏: {}", e)))?;

        if archive.len() == 0 {
            return Err(AppError::BuildError("zip 文件为空".to_string()));
        }

        // Check for required files
        let required = ["mod.json"];
        for req in required {
            let found = (0..archive.len()).any(|i| {
                archive.by_index(i)
                    .map(|f| f.name().ends_with(req))
                    .unwrap_or(false)
            });
            if !found {
                return Err(AppError::BuildError(
                    format!("包验证失败: 缺少 {}", req)
                ));
            }
        }

        Ok(())
    }
}