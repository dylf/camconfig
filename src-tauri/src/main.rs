// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use v4l::context;
use v4l::prelude::*;

#[tauri::command]
fn get_devices() -> Vec<VideoDevice> {
    let devices = context::enum_devices()
        .iter()
        .map(|dev| {
            let name = dev.name().unwrap();
            let path = dev.path().to_str().unwrap();
            VideoDevice {
                name: name.to_string(),
                path: path.to_string(),
            }
        })
        .collect::<Vec<VideoDevice>>();
    devices
}

#[tauri::command]
fn get_device_capabilities(path: String) -> String {
    let dev = Device::with_path(path).unwrap();
    let caps = dev.query_caps().unwrap();
    caps.to_string()
}

#[derive(Debug, serde::Serialize)]
struct VideoDevice {
    name: String,
    path: String,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_device_capabilities,
            get_devices
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
