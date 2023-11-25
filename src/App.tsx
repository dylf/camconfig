import { createSignal, onMount, For } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { Camera } from "lucide-solid";
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

function App() {
  const [devCapabilities, setDevCapabilities] = createSignal("");
  const [devices, setDevices] = createSignal<Device[]>([]);
  const [controls, setControls] = createSignal<DeviceControls>([]);
  const [selectedDevice, setSelectedDevice] = createSignal<string>();

  const handleDeviceChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setSelectedDevice(target.value);
    selectDevice();
  };

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
    } finally {
      console.log(controls());
    }
  }

  onMount(async () => {
    setDevices(await invoke("get_devices"));
    setControls(await invoke("get_device_controls", { path: "/dev/video0" }));
    setSelectedDevice(devices()[0].path);
    selectDevice();
  });

  return (
    <div class="flex flex-col">
      <div class="px-6 py-3 flex-row border-zinc-800 border-solid border-b">
        <h1 class="text-3xl">
          Cam config
          <Camera class="inline-block ml-2" color="white" size={36} />
        </h1>
      </div>
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
      <div class="flex flex-row flex-grow h-full">
        <div class="px-6 py-3 flex-col w-4/6 border-zinc-800 border-r border-solid h-full flex-grow ">
          <ControlForm controls={controls} selectedDevice={selectedDevice} />
        </div>
        <div class="px-6 py-3 flex-col p-8 w-1/3">
          <h2 class="text-xl mb-2 font-bold">Device Capabilities</h2>
          <p>{devCapabilities()}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
