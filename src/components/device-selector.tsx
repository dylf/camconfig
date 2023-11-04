import { JSX } from "solid-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Device } from "@/types";
import { Label } from "@/components/ui/label";

type Props = {
  devices: Device[];
  setSelectedDevice: (path: string) => void;
  selectDevice: () => void;
};

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
};

export function DeviceSelector(props: Props): JSX.Element {
  const { devices, setSelectedDevice, selectDevice } = props;

  const onChange = (item: SelectOption) => {
    setSelectedDevice(item.value);
    selectDevice();
  };

  const selectOptions: SelectOption[] = devices.map((device) => ({
    value: device.path,
    label: `${device.index} ${device.name} (${device.path})`,
    disabled: false,
  }));

  return (
    <>
      <div class="flex-col">
        <Label>Video Device</Label>
        <Select
          // value={value()}
          onChange={onChange}
          options={selectOptions}
          optionValue="value"
          optionTextValue="label"
          optionDisabled="disabled"
          placeholder="Select a device"
          itemComponent={(props) => (
            <SelectItem item={props.item}>{props.item.textValue}</SelectItem>
          )}
        >
          <SelectTrigger aria-label="devices" class="w-1/4">
            <SelectValue<SelectOption>>
              {(state) => state.selectedOption().label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>
      </div>
    </>
  );
}
