use crate::models::ModConfig;
use crate::services::file_service::FileService;
use std::path::Path;

#[tauri::command]
pub async fn read_mod_json(path: String) -> Result<ModConfig, String> {
    let mod_json_path = Path::new(&path).join("mod.json");
    let content = FileService::read_file(mod_json_path.to_str().unwrap_or(""))
        .map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| format!("mod.json 格式错误: {}", e))
}

#[tauri::command]
pub async fn write_mod_json(path: String, config: ModConfig) -> Result<(), String> {
    let mod_json_path = Path::new(&path).join("mod.json");
    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("序列化失败: {}", e))?;
    FileService::write_file(mod_json_path.to_str().unwrap_or(""), &content)
        .map_err(|e| e.to_string())
}
