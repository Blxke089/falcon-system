#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Process Plugin
        .plugin(tauri_plugin_process::init())

        // Updater Plugin
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(
                        tauri_plugin_updater::Builder::new()
                            .build(),
                    )?;
            }

            // Log Plugin nur im Debug-Modus
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}