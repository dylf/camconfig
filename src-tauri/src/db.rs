use libsql::{Connection, Database, Error};
use std::fs;
use tauri::AppHandle;

pub async fn init_db(app_handle: &AppHandle) -> Result<Connection, Error> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app dir should exist.");
    fs::create_dir_all(&app_dir).expect("Failed to create the app dir.");
    let db_path = app_dir.join("db.sqlite").to_str().unwrap().to_string();

    let db = Database::open(db_path)?;
    let conn = db.connect()?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)",
        (),
    )
    .await?;
    Ok(conn)
}
