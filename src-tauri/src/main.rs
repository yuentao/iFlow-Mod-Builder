mod commands;
mod error;
mod models;
mod services;

use commands::build::AppState;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(AppState {
            packager: std::sync::Arc::new(std::sync::Mutex::new(services::packager::Packager::new())),
        })
        .invoke_handler(tauri::generate_handler![
            commands::mod_cmd::read_mod_json,
            commands::mod_cmd::write_mod_json,
            commands::build::start_build,
            commands::build::cancel_build,
            commands::file::read_file,
            commands::file::write_file,
            commands::file::file_exists,
            commands::file::create_directory,
            commands::file::delete_directory,
            commands::file::list_directory,
            commands::file::select_directory,
            commands::file::select_file,
            commands::file::save_file,
            commands::settings::get_settings,
            commands::settings::validate_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}