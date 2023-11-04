import { createSignal, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { RotateCcw } from "lucide-solid";
import {
  Slider,
  SliderFill,
  SliderLabel,
  SliderThumb,
  SliderTrack,
  SliderValueLabel,
} from "./ui/slider";

type Props = {
  min: number;
  max: number;
  step: number;
  default_val: number;
  id: number;
  name: string;
  val: { Integer: number };
  devicePath: string;
};

export function RangeControl(props: Props): JSX.Element {
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

  console.log(currentValue);
  return (
    <Slider
      minValue={min}
      maxValue={max}
      step={step}
      defaultValue={[currentValue]}
      // defaultValue{[val]}
      getValueLabel={(params) => `${params.values[0]} (default ${default_val})`}
      class="w-[300px] space-y-3"
    >
      <div class="flex w-full justify-between">
        <SliderLabel>{name}</SliderLabel>
        <SliderValueLabel />
      </div>
      <SliderTrack>
        <SliderFill />
        <SliderThumb />
      </SliderTrack>
    </Slider>
  );
  {
    /* <label> */
  }
  {
    /*   <div>{name}</div> */
  }
  {
    /*   <input */
  }
  {
    /*     name={String(id)} */
  }
  {
    /*     type="range" */
  }
  {
    /*     class="form-range" */
  }
  {
    /*     min={min} */
  }
  {
    /*     max={max} */
  }
  {
    /*     step={step} */
  }
  {
    /*     value={value()} */
  }
  {
    /*     onChange={handleChange} */
  }
  {
    /*   /> */
  }
  {
    /*   <span class="ml-2">{value()}</span> */
  }
  {
    /*   <span class="ml-4 italic">(default {default_val})</span> */
  }
  {
    /*   {value() !== default_val ? ( */
  }
  {
    /*     <button onClick={resetValue}> */
  }
  {
    /*       <RotateCcw class="inline-block ml-2" size={16} /> */
  }
  {
    /*     </button> */
  }
  {
    /*   ) : null} */
  }
  {
    /* </label> */
  }
}
