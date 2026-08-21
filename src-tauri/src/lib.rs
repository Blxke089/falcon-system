use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()

        // =====================================================
        // DEEP LINK
        // =====================================================

        .plugin(tauri_plugin_deep_link::init())

        // =====================================================
        // OPENER
        // =====================================================

        .plugin(tauri_plugin_opener::init())

        // =====================================================
        // SINGLE INSTANCE
        // =====================================================

        .plugin(
            tauri_plugin_single_instance::init(
                |_app, _args, _cwd| {}
            )
        )

        // =====================================================
        // PROCESS
        // =====================================================

        .plugin(tauri_plugin_process::init())

        // =====================================================
        // SETUP
        // =====================================================

        .setup(|app| {

            // -------------------------------------------------
            // Deep Links registrieren
            // -------------------------------------------------

            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;

                app.deep_link().register_all()?;
            }

            // -------------------------------------------------
            // Updater
            // -------------------------------------------------

            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(
                        tauri_plugin_updater::Builder::new()
                            .build(),
                    )?;
            }

            // -------------------------------------------------
            // Logging nur im Debug-Modus
            // -------------------------------------------------

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // -------------------------------------------------
            // DEVTOOLS AUTOMATISCH ÖFFNEN
            // Nur im Debug-Modus
            // -------------------------------------------------

            #[cfg(debug_assertions)]
            {
                if let Some(window) =
                    app.get_webview_window("main")
                {
                    window.open_devtools();
                }
            }

            Ok(())
        })

        // =====================================================
        // APP STARTEN
        // =====================================================

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}