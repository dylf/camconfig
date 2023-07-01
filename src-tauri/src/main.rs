// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use v4l::context;
use v4l::prelude::*;

#[derive(Debug, serde::Serialize)]
struct VideoDevice {
    name: String,
    path: String,
    index: usize,
}

#[derive(Debug, serde::Serialize)]
struct Controls {
    id: u32,
    name: String,
    min: i64,
    max: i64,
    step: u64,
    default: i64,
    control_type: ControlType,
    menu_items: Option<Vec<(u32, MItem)>>,
}

#[derive(Debug, serde::Serialize)]
enum MItem {
    Name(String),
    Value(i64),
}

#[derive(Debug, serde::Serialize)]
enum ControlType {
    Integer,
    Boolean,
    Menu,
    Button,
    Integer64,
    CtrlClass,
    String,
    Bitmask,
    IntegerMenu,
    U8,
    U16,
    U32,
    Area,
}

fn control_type_to_enum(typ: v4l::control::Type) -> ControlType {
    match typ {
        v4l::control::Type::Integer => ControlType::Integer,
        v4l::control::Type::Boolean => ControlType::Boolean,
        v4l::control::Type::Menu => ControlType::Menu,
        v4l::control::Type::Button => ControlType::Button,
        v4l::control::Type::Integer64 => ControlType::Integer64,
        v4l::control::Type::CtrlClass => ControlType::CtrlClass,
        v4l::control::Type::String => ControlType::String,
        v4l::control::Type::Bitmask => ControlType::Bitmask,
        v4l::control::Type::IntegerMenu => ControlType::IntegerMenu,
        v4l::control::Type::U8 => ControlType::U8,
        v4l::control::Type::U16 => ControlType::U16,
        v4l::control::Type::U32 => ControlType::U32,
        v4l::control::Type::Area => ControlType::Area,
    }
}

fn menu_item_to_enum(item: &v4l::control::MenuItem) -> MItem {
    match item {
        v4l::control::MenuItem::Name(name) => MItem::Name(name.to_string()),
        v4l::control::MenuItem::Value(value) => MItem::Value(*value),
    }
}

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
                index: dev.index(),
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

#[tauri::command]
fn get_device_controls(path: String) -> Result<Vec<Controls>, String> {
    let dev = Device::with_path(path).map_err(|e| format!("{}", e))?;
    let controls = dev.query_controls().map_err(|e| format!("{}", e))?;

    Ok(controls
        .iter()
        .map(|c| Controls {
            id: c.id,
            name: c.name.clone(),
            min: c.minimum,
            max: c.maximum,
            step: c.step,
            default: c.default,
            control_type: control_type_to_enum(c.typ),
            menu_items: match &c.items {
                Some(items) => Some(
                    items
                        .iter()
                        .map(|(i, item)| (*i, menu_item_to_enum(item)))
                        .collect::<Vec<(u32, MItem)>>(),
                ),
                None => None,
            },
        })
        .collect::<Vec<Controls>>())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_device_capabilities,
            get_devices,
            get_device_controls
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
