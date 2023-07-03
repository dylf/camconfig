import { createSignal, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";

type Props = {
  min: number;
  max: number;
  step: number;
  default_val: number;
  id: number;
  name: string;
  val: any;
  devicePath: string;
};

function RangeControl(props: Props): JSX.Element {
  const { min, max, step, default_val, id, name, devicePath } = props;

  const [value, setValue] = createSignal(default_val);
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const valueAsNumber = target.valueAsNumber;
    setValue(valueAsNumber);
    invoke("set_control_val", {
      path: devicePath,
      controlId: id,
      value: { Integer: valueAsNumber },
    });
  };

  return (
    <label>
      {name}
      <input
        name={String(id)}
        type="range"
        class="form-range block"
        min={min}
        max={max}
        step={step}
        value={value()}
        onChange={handleChange}
      />
    </label>
  );
}

export default RangeControl;
