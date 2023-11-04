import { createSignal, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";

type Props = {
  default_val: number;
  id: number;
  name: string;
  val: any;
  devicePath: string;
};

function BooleanControl(props: Props): JSX.Element {
  const { default_val, id, name, devicePath, val } = props;
  console.log(name, val);

  const [isChecked, setIsChecked] = createSignal(!!default_val);

  const handleChange = () => {
    const val = !isChecked();
    setIsChecked(val);
    invoke("set_control_val", {
      path: devicePath,
      controlId: id,
      value: { Boolean: val },
    });
  };

  return (
    <label>
      {name}
      <input
        class="form-checkbox rounded p-2 block w-100"
        type="checkbox"
        name={name}
        onChange={handleChange}
        checked={isChecked()}
      />
    </label>
  );
}

export default BooleanControl;
