interface SheetSetting {
  mode: 'edit' | 'read';
  view: {
    height: () => number;
    width: () => number;
  };
  showGrid: boolean;
  showToolbar: boolean;
  showContextmenu: boolean;
  row: {
    len: number;
    height: number;
  };
  col: {
    len: number;
    width: number;
    indexWidth: number;
    minWidth: number;
  };
  style: {
    bgcolor: string;
    align: 'left';
    valign: 'middle';
    textwrap: boolean;
    strike: boolean;
    underline: boolean;
    color: string;
    font: {
      name: 'Arial';
      size: number;
      bold: boolean;
      italic: boolean;
    };
    format: 'normal';
  };
}
