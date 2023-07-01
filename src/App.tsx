import { createSignal, onMount, For } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

type Device = {
  name: string;
  path: string;
};

function App() {
  const [devCapabilities, setDevCapabilities] = createSignal("");
  const [devices, setDevices] = createSignal<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = createSignal<string>();

  async function selectDevice() {
    setDevCapabilities(
      await invoke("get_device_capabilities", { path: selectedDevice() })
    );
  }

  onMount(async () => {
    setDevices(await invoke("get_devices"));
    setSelectedDevice(devices()[0].path);
  });

  return (
    <div class="container">
      <div class="row">
        <h1>Cam config</h1>
      </div>

      <select
        name="device"
        id="device-select"
        onChange={(e) => setSelectedDevice(e.target.value)}
      >
        <For each={devices()}>
          {(device) => (
            <option
              value={device.path}
            >{`${device.name} (${device.path})`}</option>
          )}
        </For>
      </select>
      <form
        class="row"
        onSubmit={(e) => {
          e.preventDefault();
          selectDevice();
        }}
      >
        <button type="submit">Get Device Capabilities</button>
      </form>

      <p>{devCapabilities()}</p>
    </div>
  );
}

export default App;
