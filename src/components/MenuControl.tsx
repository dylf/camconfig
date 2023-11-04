import { createSignal, For, JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";

type Props = {
  name: string;
  menu_items: [number, { Name: string; Value: number }][];
  val: any;
};

type SelectOption = {
  value: number;
  label: string;
  disabled: boolean;
};

export function MenuControl(props: Props): JSX.Element {
  const { name, menu_items } = props;
  console.log("mprops", props);

  const [value, setValue] = createSignal("");

  return (
    <div class="flex-col">
      <Label>{name}</Label>
      <Select
        // value={value()}
        // onChange={setValue}
        options={menu_items.map((item) => ({
          value: item[0],
          label: item[1].Name,
          disabled: false,
        }))}
        optionValue="value"
        optionTextValue="label"
        optionDisabled="disabled"
        itemComponent={(props) => (
          <SelectItem item={props.item}>{props.item.textValue}</SelectItem>
        )}
      >
        <SelectTrigger aria-label={name} class="w-1/2">
          <SelectValue<SelectOption>>
            {(state) => state.selectedOption().label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    </div>
  );
}
