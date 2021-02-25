import { EventTypes } from '../components';

type PluginToolbarItemType = 'switch' | 'list' | 'custom' | 'none';

type PluginToolbarDataTypeBase = { [key: string]: any; disabled: boolean }
type PluginToolbarSwitchType = {
  type: 'switch';
  data: PluginToolbarDataTypeBase & { switch: boolean };
}
type PluginToolbarListType = {
  type: 'list';
  data: PluginToolbarDataTypeBase & { list: string[] };
}
type PluginToolbarCustomType = {
  type: 'custom';
  data: PluginToolbarDataTypeBase;
}

type PluginToolbarDataType<T extends PluginToolbarItemType> =
  T extends 'switch' ? PluginToolbarSwitchType
    : T extends 'list' ? PluginToolbarListType
    : T extends 'custom' ? PluginToolbarCustomType
    : never;

type PluginToolbarType<T extends PluginToolbarItemType = 'none'> = T extends 'none' ? {} : { toolbar: PluginToolbarDataType<T> }

type PluginEvents = {
  on?: {
    [key in EventTypes]?: (e: unknown) => void;
  };
}

type PluginOption<T extends PluginToolbarItemType = 'none'> = { name: string }
  & PluginToolbarType<T>
  & PluginEvents

export default PluginOption;
