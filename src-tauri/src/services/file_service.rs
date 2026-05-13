use std::fs;
use std::path::Path;
use crate::error::AppError;

pub struct FileService;

impl FileService {
    pub fn read_file(path: &str) -> Result<String, AppError> {
        fs::read_to_string(path).map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                AppError::FileNotFound(path.to_string())
            } else {
                AppError::IoError(e)
            }
        })
    }

    pub fn write_file(path: &str, content: &str) -> Result<(), AppError> {
        fs::write(path, content).map_err(|e| AppError::IoError(e))
    }

    pub fn file_exists(path: &str) -> bool {
        Path::new(path).exists()
    }

    pub fn create_directory(path: &str) -> Result<(), AppError> {
        fs::create_dir_all(path).map_err(|e| AppError::IoError(e))
    }

    pub fn delete_directory(path: &str) -> Result<(), AppError> {
        fs::remove_dir_all(path).map_err(|e| AppError::IoError(e))
    }

    pub fn list_directory(path: &str) -> Result<Vec<String>, AppError> {
        let mut result = Vec::new();
        for entry in fs::read_dir(path).map_err(|e| AppError::IoError(e))? {
            let entry = entry.map_err(|e| AppError::IoError(e))?;
            let name = entry.file_name().to_string_lossy().to_string();
            if !name.starts_with('.') && !name.ends_with(".iflow-mod") {
                result.push(name);
            }
        }
        Ok(result)
    }
}