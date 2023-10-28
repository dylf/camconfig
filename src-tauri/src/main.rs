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
struct Control {
    id: u32,
    name: String,
    min: i64,
    max: i64,
    step: u64,
    default: i64,
    value: ControlValue,
    control_type: ControlType,
    menu_items: Option<Vec<(u32, MItem)>>,
}

#[derive(Debug, serde::Serialize)]
struct ControlGroup {
    id: u32,
    name: String,
    controls: Vec<Control>,
}

#[derive(Debug, serde::Serialize)]
enum DeviceControls {
    ControlGroup(ControlGroup),
    Control(Control),
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

#[derive(Debug, serde::Serialize, serde::Deserialize)]
enum ControlValue {
    None,
    Integer(i64),
    Boolean(bool),
    String(String),
    CompoundU8(Vec<u8>),
    CompoundU16(Vec<u16>),
    CompoundU32(Vec<u32>),
    CompoundPtr(Vec<u8>),
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

fn control_val_to_enum(val: &v4l::control::Value) -> ControlValue {
    match val {
        v4l::control::Value::None => ControlValue::None,
        v4l::control::Value::Integer(value) => ControlValue::Integer(*value),
        v4l::control::Value::Boolean(value) => ControlValue::Boolean(*value),
        v4l::control::Value::String(value) => ControlValue::String(value.to_string()),
        v4l::control::Value::CompoundU8(value) => ControlValue::CompoundU8(value.to_vec()),
        v4l::control::Value::CompoundU16(value) => ControlValue::CompoundU16(value.to_vec()),
        v4l::control::Value::CompoundU32(value) => ControlValue::CompoundU32(value.to_vec()),
        v4l::control::Value::CompoundPtr(value) => ControlValue::CompoundPtr(value.to_vec()),
    }
}

fn control_val_to_v4l(val: &ControlValue) -> v4l::control::Value {
    match val {
        ControlValue::None => v4l::control::Value::None,
        ControlValue::Integer(value) => v4l::control::Value::Integer(*value),
        ControlValue::Boolean(value) => v4l::control::Value::Boolean(*value),
        ControlValue::String(value) => v4l::control::Value::String(value.to_string()),
        ControlValue::CompoundU8(value) => v4l::control::Value::CompoundU8(value.to_vec()),
        ControlValue::CompoundU16(value) => v4l::control::Value::CompoundU16(value.to_vec()),
        ControlValue::CompoundU32(value) => v4l::control::Value::CompoundU32(value.to_vec()),
        ControlValue::CompoundPtr(value) => v4l::control::Value::CompoundPtr(value.to_vec()),
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
fn get_device_controls(path: String) -> Result<Vec<DeviceControls>, String> {
    let dev = Device::with_path(path).map_err(|e| format!("{}", e))?;
    let controls = dev.query_controls().map_err(|e| format!("{}", e))?;
    let mut device_controls: Vec<DeviceControls> = Vec::new();

    for ctrl in controls {
        match control_type_to_enum(ctrl.typ) {
            ControlType::CtrlClass => {
                device_controls.push(DeviceControls::ControlGroup(ControlGroup {
                    id: ctrl.id,
                    name: ctrl.name,
                    controls: Vec::new(),
                }));
            }
            ctrl_type => {
                let ctrl_val = match dev.control(ctrl.id) {
                    Ok(ctrl) => control_val_to_enum(&ctrl.value),
                    Err(_) => ControlValue::None,
                };
                let current_ctrl = Control {
                    id: ctrl.id,
                    name: ctrl.name.clone(),
                    min: ctrl.minimum,
                    max: ctrl.maximum,
                    step: ctrl.step,
                    default: ctrl.default,
                    value: ctrl_val,
                    control_type: ctrl_type,
                    menu_items: match &ctrl.items {
                        Some(items) => Some(
                            items
                                .iter()
                                .map(|(i, item)| (*i, menu_item_to_enum(item)))
                                .collect::<Vec<(u32, MItem)>>(),
                        ),
                        None => None,
                    },
                };
                match device_controls.last_mut() {
                    Some(DeviceControls::ControlGroup(ControlGroup { controls, .. })) => {
                        controls.push(current_ctrl)
                    }
                    _ => device_controls.push(DeviceControls::Control(current_ctrl)),
                }
            }
        }
    }
    Ok(device_controls)
}

#[tauri::command]
fn set_control_val(path: String, control_id: u32, value: ControlValue) -> Result<(), String> {
    let dev = Device::with_path(path).map_err(|e| format!("{}", e))?;
    let control = v4l::Control {
        id: control_id,
        value: control_val_to_v4l(&value),
    };
    dev.set_control(control).map_err(|e| format!("{}", e))?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_device_capabilities,
            get_devices,
            get_device_controls,
            set_control_val
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
