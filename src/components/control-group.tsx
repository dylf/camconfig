import { For } from "solid-js";
import { Control } from "@/components/control";
import { DeviceControlGroup } from "@/types";

type Props = {
  controlGroup: DeviceControlGroup;
  selectedDevice: () => string | undefined;
};

export function ControlGroup({ controlGroup, selectedDevice }: Props) {
  return (
    <div class="block mb-2">
      <div class="text-xl">{controlGroup.name}</div>
      <For each={controlGroup.controls}>
        {(control) => (
          <Control control={control} selectedDevice={selectedDevice} />
        )}
      </For>
    </div>
  );
}
