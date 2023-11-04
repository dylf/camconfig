import { createSignal, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { Switch } from "@/components/ui/switch";

type Props = {
  default_val: number;
  id: number;
  name: string;
  val: any;
  devicePath: string;
};

export function BooleanControl(props: Props): JSX.Element {
  const { id, name, devicePath, val } = props;

  const handleChange = (isChecked: boolean) => {
    invoke("set_control_val", {
      path: devicePath,
      controlId: id,
      value: { Boolean: isChecked },
    });
  };

  return <Switch label={name} onChange={handleChange} defaultChecked={!!val} />;
}
