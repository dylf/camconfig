import { createSignal, onMount, For, Switch, Match } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";

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
  control_type: "Integer" | "Boolean" | "Menu" | "CtrlClass";
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
    setControls(
      await invoke("get_device_controls", { path: selectedDevice() })
    );
    console.log(controls());
  }

  onMount(async () => {
    setDevices(await invoke("get_devices"));
    setControls(await invoke("get_device_controls", { path: "/dev/video0" }));
    setSelectedDevice(devices()[0].path);
  });

  return (
    <div class="bg-zinc-800 text-white">
      <div class="row">
        <h1 class="text-3xl">Cam config</h1>
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
                <label>
                  {control.name}
                  <input
                    class="form-checkbox rounded p-2 block"
                    type="checkbox"
                    name={control.name}
                  />
                </label>
              </Match>
              <Match when={control.control_type === "Integer"}>
                <label>
                  {control.name}
                  <input
                    type="range"
                    class="form-range block"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.default}
                  />
                </label>
              </Match>
            </Switch>
          </div>
        )}
      </For>
      <form
        class="row"
        onSubmit={(e) => {
          e.preventDefault();
          selectDevice();
        }}
      >
        <button
          type="submit"
          class="bg-zinc-700 rounded-md p-4 my-2 hover:bg-zinc-900"
        >
          Get Device Capabilities
        </button>
      </form>
      <p>{devCapabilities()}</p>
    </div>
  );
}

export default App;
