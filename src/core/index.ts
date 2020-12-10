interface FontSetting {
  name: 'Arial';
  size: number;
  bold: boolean;
  italic: boolean;
}

interface StyleSetting {
  bgcolor: string;
  align: 'left';
  valign: 'middle';
  textwrap: boolean;
  strike: boolean;
  underline: boolean;
  color: string;
  font: FontSetting;
  format: 'normal';
}

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
  style: StyleSetting;
}

interface Cell {
  style: number;
  type: string;
  text: string;
  value: string; // cal result
  merge?: number[];
}

interface Cells {
  [key: number]: Cell;
}

interface Row {
  height: number;
  style: number;
  hide?: boolean;
  cells: Cells;
}

interface Col {
  width: number;
  style: number;
  hide?: boolean;
}
