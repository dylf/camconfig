import { Switch, Match } from "solid-js";
import { RangeControl } from "@/components/RangeControl";
import { BooleanControl } from "@/components/BooleanControl";
import { MenuControl } from "@/components/MenuControl";
import { DeviceControl } from "@/types";

type Props = {
  control: DeviceControl;
  selectedDevice: () => string | undefined;
};

export function Control({ control, selectedDevice }: Props) {
  return (
    <div class="block mb-2">
      <Switch fallback={<div>Unknown control</div>}>
        <Match when={control.control_type === "Menu"}>
          <MenuControl
            menu_items={control.menu_items}
            name={control.name}
            val={control.value}
          />
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
