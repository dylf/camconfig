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

type Controls = {
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

function App() {
  const [devCapabilities, setDevCapabilities] = createSignal("");
  const [devices, setDevices] = createSignal<Device[]>([]);
  const [controls, setControls] = createSignal<Controls[]>([]);
  const [selectedDevice, setSelectedDevice] = createSignal<string>();

  async function selectDevice() {
    setDevCapabilities(
      await invoke("get_device_capabilities", { path: selectedDevice() })
    );
    try {
      const controls: Controls[] = await invoke("get_device_controls", {
        path: selectedDevice(),
      });
      setControls(controls);
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
  });

  return (
    <div class="">
      <div class="row">
        <h1 class="text-3xl">
          Cam config
          <Camera class="inline-block ml-2" color="white" size={36} />
        </h1>
      </div>
      <select
        class="form-select bg-zinc-700 text-white"
        name="device"
        id="device-select"
        onChange={(e) => setSelectedDevice(e.target.value)}
      >
        <For each={devices()}>
          {(device) => (
            <option
              value={device.path}
            >{`${device.index} ${device.name} (${device.path})`}</option>
          )}
        </For>
      </select>
      <button
        type="submit"
        class="bg-zinc-700 rounded-md p-4 my-2 hover:bg-zinc-900"
        onClick={() => selectDevice()}
      >
        Get Device Capabilities
      </button>
      <p>{devCapabilities()}</p>

      <For each={controls()}>
        {(control) => (
          <div class="block mb-2">
            <Switch fallback={<div>Unknown control</div>}>
              <Match when={control.control_type === "CtrlClass"}>
                <div class="text-xl">{control.name}</div>
              </Match>
              <Match when={control.control_type === "Menu"}>
                <label>
                  {control.name}
                  <select class="form-select block bg-zinc-700">
                    <For each={control.menu_items}>
                      {(item) => (
                        <option value={item[0]}>{item[1].Name}</option>
                      )}
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
        )}
      </For>
    </div>
  );
}

export default App;
