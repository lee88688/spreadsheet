type ToolbarItemType = 'switch' | 'list' | 'custom' | 'none';

type ToolbarDataType<T extends ToolbarItemType = 'none'> = T extends 'switch' ?
  { switch: boolean } : T

type S = ToolbarDataType<'switch'>;

interface PluginOption {
  name: string;
  toolbar: {
    type: ToolbarItemType;
    data: {
      [key: string]: any;
      disabled?: boolean;
      switch?: boolean;
      list?: string[];
    };
  };
}

export default PluginOption;
