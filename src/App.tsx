import { createSignal, onMount, For } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { Camera } from "lucide-solid";
import { Col, Grid } from "@/components/ui/grid";
import { Separator } from "@/components/ui/seperator";
import { DeviceControl, DeviceControlGroup, Device } from "@/types";
import { DeviceSelector } from "@/components/device-selector";
import { ControlGroup } from "@/components/control-group";

type DeviceControls = Array<DeviceControlGroup | DeviceControl>;
type DeviceControlsResponse = Array<
  | {
      Control: DeviceControl;
      ControlGroup: never;
    }
  | { ControlGroup: DeviceControlGroup; Control: never }
>;

function isControlGroup(
  control: DeviceControlGroup | DeviceControl
): control is DeviceControlGroup {
  console.log(Object.keys(control));
  return (control as DeviceControlGroup).controls !== undefined;
}

function App() {
  const [devCapabilities, setDevCapabilities] = createSignal("");
  const [devices, setDevices] = createSignal<Device[]>([]);
  const [controls, setControls] = createSignal<DeviceControls>([]);
  const [selectedDevice, setSelectedDevice] = createSignal<string>();

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
  });

  return (
    <Grid cols={1} class="p-2">
      <Col>
        <div class="row p-2">
          <h1 class="text-3xl">
            Cam config
            <Camera class="inline-block ml-2" color="white" size={36} />
          </h1>
        </div>
        <Separator />
        <DeviceSelector
          devices={devices()}
          selectDevice={selectDevice}
          setSelectedDevice={setSelectedDevice}
        />
      </Col>
      <Grid cols={1} colsMd={3}>
        <Col span={1} class="p-2">
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
        </Col>
        <Col span={1} spanMd={2}>
          <p>{devCapabilities()}</p>
        </Col>
      </Grid>
    </Grid>
  );
}

export default App;
