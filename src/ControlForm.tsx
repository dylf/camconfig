import { Accessor, For, Match, Switch } from "solid-js";
import { Control, ControlGroup, DeviceControls } from "./App";
import BooleanControl from "./BooleanControl";
import RangeControl from "./RangeControl";

type Props = {
  controls: Accessor<DeviceControls>;
  selectedDevice: Accessor<string | undefined>;
};

function isControlGroup(
  control: ControlGroup | Control,
): control is ControlGroup {
  console.log(Object.keys(control));
  return (control as ControlGroup).controls !== undefined;
}

export function ControlForm(props: Props) {
  const { controls, selectedDevice } = props;
  return (
    <For each={controls()}>
      {(control) => {
        if (isControlGroup(control)) {
          return (
            <ControlGroupForm
              controlGroup={control}
              selectedDevice={selectedDevice}
            />
          );
        } else {
          console.log(control);
        }
      }}
    </For>
  );
}

function ControlGroupForm({
  controlGroup,
  selectedDevice,
}: {
  controlGroup: ControlGroup;
  selectedDevice: Accessor<string | undefined>;
}) {
  return (
    <div class="block mb-4 w-100">
      <div class="text-xl mb-2 font-bold">{controlGroup.name}</div>
      <For each={controlGroup.controls}>
        {(control) => (
          <ControlInput control={control} selectedDevice={selectedDevice} />
        )}
      </For>
    </div>
  );
}

function ControlInput({
  control,
  selectedDevice,
}: {
  control: Control;
  selectedDevice: Accessor<string | undefined>;
}) {
  return (
    <div class="block py-1">
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
