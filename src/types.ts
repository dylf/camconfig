export type Device = {
  name: string;
  path: string;
  index: number;
};

export type ControlGroup = {
  id: number;
  name: string;
  controls: Control[];
};
