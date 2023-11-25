import {
  createSignal,
  onMount,
  For,
  Accessor,
  Setter,
  Switch,
  Match,
} from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { Camera, Settings, SlidersHorizontal } from "lucide-solid";
import { ControlForm } from "./ControlForm";

type Device = {
  name: string;
  path: string;
  index: number;
};

export type Control = {
  id: number;
  name: string;
  min: number;
  max: number;
  step: number;
  default: number;
  value: any;
  control_type: "Integer" | "Boolean" | "Menu" | "CtrlClass";
  menu_items: [number, { Name: string; Value: number }][];
};

export type ControlGroup = {
  id: number;
  name: string;
  controls: Control[];
};

export type DeviceControls = Array<ControlGroup | Control>;
type DeviceControlsResponse = Array<
  | {
    Control: Control;
    ControlGroup: never;
  }
  | { ControlGroup: ControlGroup; Control: never }
>;

type AppState = "Settings" | "Controls";

const [devCapabilities, setDevCapabilities] = createSignal("");
const [devices, setDevices] = createSignal<Device[]>([]);
const [controls, setControls] = createSignal<DeviceControls>([]);
const [selectedDevice, setSelectedDevice] = createSignal<string>();
const [appState, setAppState] = createSignal<AppState>("Controls");

function App() {
  return (
    <div class="flex flex-col h-screen">
      <TopBar />
      <Switch>
        <Match when={appState() === "Controls"}>
          <DeviceForm></DeviceForm>
        </Match>
        <Match when={appState() === "Settings"}>
          <SettingsForm />
        </Match>
      </Switch>
    </div>
  );
}

const TopBar = () => {
  const toggleAppState = (e: Event) => {
    e.preventDefault();
    setAppState(appState() === "Controls" ? "Settings" : "Controls");
  };

  return (
    <div class="px-6 py-3 flex-row border-zinc-800 border-solid border-b w-full">
      <div class="flex">
        <h1 class="flex-col text-3xl py-2">
          Cam Config
          <Camera class="inline-block ml-2" color="white" size={36} />
        </h1>
        <div class="flex-col ml-auto">
          <button
            class="hover:bg-zinc-900 p-2 rounded-xl"
            title={appState() === "Settings" ? "Controls" : "Settings"}
            onClick={toggleAppState}
          >
            <Switch>
              <Match when={appState() === "Settings"}>
                <SlidersHorizontal
                  class="inline-block"
                  color="white"
                  size={32}
                />
              </Match>
              <Match when={appState() === "Controls"}>
                <Settings class="inline-block" color="white" size={32} />
              </Match>
            </Switch>
          </button>
        </div>
      </div>
    </div>
  );
};

const DeviceForm = () => {
  async function selectDevice() {
    setDevCapabilities(
      await invoke("get_device_capabilities", { path: selectedDevice() }),
    );
    try {
      const controls: DeviceControlsResponse = await invoke(
        "get_device_controls",
        {
          path: selectedDevice(),
        },
      );
      setControls(controls.map((c) => c.Control || c.ControlGroup));
    } catch (e) {
      console.warn(e);
      setControls([]);
    }
  }

  onMount(async () => {
    if (!selectedDevice()) {
      setDevices(await invoke("get_devices"));
      setControls(await invoke("get_device_controls", { path: "/dev/video0" }));
      setSelectedDevice(devices()[0].path);
      selectDevice();
    }
  });
  const handleDeviceChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSelectedDevice(target.value);
    selectDevice();
  };
  return (
    <>
      <div class="px-6 py-3 flex-row border-zinc-800 border-solid border-b">
        <label for="device" class="mr-2">
          Device
        </label>
        <select
          class="form-select bg-black text-white rounded-lg"
          name="device"
          id="device-select"
          onChange={handleDeviceChange}
        >
          <For each={devices()}>
            {(device) => (
              <option
                value={device.path}
              >{`${device.name} (${device.path})`}</option>
            )}
          </For>
        </select>
      </div>
      <div class="items-stretch flex flex-row flex-grow">
        <div class="px-6 py-3 flex-col w-4/6 border-zinc-800 border-r border-solid h-full flex-grow ">
          <ControlForm controls={controls} selectedDevice={selectedDevice} />
        </div>
        <div class="px-6 py-3 flex-col p-8 w-1/3">
          <h2 class="text-xl mb-2 font-bold">Device Capabilities</h2>
          <p>{devCapabilities()}</p>
        </div>
      </div>
    </>
  );
};

const SettingsForm = () => {
  return (
    <div class="flex-grow flex flex-col p-8 text-xl">Nothing to see here</div>
  );
};

export default App;
