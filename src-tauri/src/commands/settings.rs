use crate::models::Settings;
use crate::services::settings_service::SettingsService;

#[tauri::command]
pub async fn get_settings() -> Result<Settings, String> {
    Ok(SettingsService::get_default_settings())
}

#[tauri::command]
pub async fn validate_settings(settings: Settings) -> Result<(), String> {
    SettingsService::validate_settings(&settings).map_err(|e| e.to_string())
}