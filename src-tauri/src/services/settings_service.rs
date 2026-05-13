use crate::models::Settings;

pub struct SettingsService;

impl SettingsService {
    pub fn get_default_settings() -> Settings {
        Settings::default()
    }

    pub fn validate_settings(settings: &Settings) -> Result<(), String> {
        if settings.default_output_path.is_empty() {
            return Err("输出路径不能为空".to_string());
        }
        Ok(())
    }
}