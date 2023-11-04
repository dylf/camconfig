import { createSignal, onMount, For, Switch, Match } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { Camera } from "lucide-solid";
import RangeControl from "./RangeControl";
import BooleanControl from "./BooleanControl";

type Device = {
  name: string;
  path: string;
  index: number;
};

type Control = {
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

type ControlGroup = {
  id: number;
  name: string;
  controls: Control[];
};

type DeviceControls = Array<ControlGroup | Control>;
type DeviceControlsResponse = Array<
  | {
      Control: Control;
      ControlGroup: never;
    }
  | { ControlGroup: ControlGroup; Control: never }
>;

function isControlGroup(
  control: ControlGroup | Control
): control is ControlGroup {
  console.log(Object.keys(control));
  return (control as ControlGroup).controls !== undefined;
}

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
      await invoke("get_device_capabilities", { path: selectedDevice() })
    );
    try {
      const controls: DeviceControlsResponse = await invoke(
        "get_device_controls",
        {
          path: selectedDevice(),
        }
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
      <div class="flex-row p-2 border-zinc-800 border-solid border-b">
        <h1 class="text-3xl">
          Cam config
          <Camera class="inline-block ml-2" color="white" size={36} />
        </h1>
      </div>
      <div class="flex-row p-2 border-zinc-800 border-solid border-b">
        <label for="device" class="mr-2">
          Video Device
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
      <div class="flex flex-row p-2 flex-grow h-full">
        <div class="flex-col w-1/2 border-zinc-800 border-r border-solid h-full flex-grow ">
          <For each={controls()}>
            {(control) => {
              if (isControlGroup(control)) {
                return (
                  <ControlGroup
                    controlGroup={control}
                    selectedDevice={selectedDevice}
                  />
                );
              } else {
                console.log(control);
              }
            }}
          </For>
        </div>
        <div class="col p-8">
          <p>{devCapabilities()}</p>
        </div>
      </div>
    </div>
  );
}

type Props = {
  controlGroup: ControlGroup;
  selectedDevice: () => string | undefined;
};

function ControlGroup({ controlGroup, selectedDevice }: Props) {
  return (
    <div class="block mb-4 w-100">
      <div class="text-xl mb-2">{controlGroup.name}</div>
      <For each={controlGroup.controls}>
        {(control) => (
          <Control control={control} selectedDevice={selectedDevice} />
        )}
      </For>
    </div>
  );
}

type CProps = {
  control: Control;
  selectedDevice: () => string | undefined;
};

function Control({ control, selectedDevice }: CProps) {
  return (
    <div class="block mb-2">
      <Switch fallback={<div>Unknown control</div>}>
        <Match when={control.control_type === "Menu"}>
          <label>
            {control.name}
            <select class="form-select block bg-black rounded-lg text-white">
              <For each={control.menu_items}>
                {(item) => <option value={item[0]}>{item[1].Name}</option>}
              </For>
            </select>
          </label>
        </Match>
        <Match when={control.control_type === "Boolean"}>
          <BooleanControl
            devicePath={selectedDevice() ?? ""}
            id={control.id}
            name={control.name}
            val={control.value}
            default_val={control.default}
          />
        </Match>
        <Match when={control.control_type === "Integer"}>
          <RangeControl
            devicePath={selectedDevice() ?? ""}
            min={control.min}
            max={control.max}
            step={control.step}
            default_val={control.default}
            id={control.id}
            name={control.name}
            val={control.value}
          />
        </Match>
      </Switch>
    </div>
  );
}

export default App;
