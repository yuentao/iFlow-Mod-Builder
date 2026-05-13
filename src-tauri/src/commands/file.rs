use crate::services::file_service::FileService;

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    FileService::read_file(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    FileService::write_file(&path, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn file_exists(path: String) -> bool {
    FileService::file_exists(&path)
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    FileService::create_directory(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_directory(path: String) -> Result<(), String> {
    FileService::delete_directory(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<String>, String> {
    FileService::list_directory(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn select_directory(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let dir = app.dialog().file().blocking_pick_folder();
    Ok(dir.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn select_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let file = app.dialog()
        .file()
        .add_filter("JavaScript", &["js"])
        .blocking_pick_file();
    Ok(file.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn save_file(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let file = app.dialog()
        .file()
        .add_filter("iFlow Mod", &["iflow-mod"])
        .set_file_name("mod.iflow-mod")
        .blocking_save_file();
    Ok(file.map(|p| p.to_string()))
}
