import { createSignal, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { RotateCcw } from "lucide-solid";

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
  const { min, max, step, default_val, id, name, devicePath, val } = props;
  const { Integer: currentValue } = val;

  const [value, setValue] = createSignal(currentValue || default_val);
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

  const resetValue = () => {
    setValue(default_val);
    invoke("set_control_val", {
      path: devicePath,
      controlId: id,
      value: { Integer: default_val },
    });
  };

  return (
    <label>
      <div>{name}</div>
      <input
        name={String(id)}
        type="range"
        class="form-range"
        min={min}
        max={max}
        step={step}
        value={value()}
        onChange={handleChange}
      />
      <span class="ml-2">{value()}</span>
      <span class="ml-4 italic">(default {default_val})</span>
      {value() !== default_val ? (
        <button onClick={resetValue}>
          <RotateCcw class="inline-block ml-2" size={16} />
        </button>
      ) : null}
    </label>
  );
}

export default RangeControl;
