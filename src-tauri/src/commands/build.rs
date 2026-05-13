use tauri::State;
use crate::models::{BuildConfig, BuildResult};
use crate::services::packager::Packager;

pub struct AppState {
    pub packager: std::sync::Arc<std::sync::Mutex<Packager>>,
}

#[tauri::command]
pub async fn start_build(
    config: BuildConfig,
    state: State<'_, AppState>,
) -> Result<BuildResult, String> {
    let packager = state.packager.lock().unwrap();
    packager.build(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cancel_build(state: State<'_, AppState>) -> Result<(), String> {
    let packager = state.packager.lock().unwrap();
    packager.set_cancel(true);
    Ok(())
}