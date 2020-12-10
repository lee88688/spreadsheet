export interface FontSetting {
  name: 'Arial';
  size: number;
  bold: boolean;
  italic: boolean;
}

export type RowAlignType = 'left' | 'center' | 'right'
export type ColAlignType = 'top' | 'middle' | 'bottom'

export interface StyleSetting {
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

export interface SheetSetting {
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

export interface Cell {
  style: number;
  type: string;
  text: string;
  value: string; // cal result
  merge?: number[];
  editable?: boolean;
}

export interface Cells {
  [key: number]: Cell;
}

export interface Row {
  height: number;
  style: number;
  hide?: boolean;
  cells: Cells;
}

export interface Col {
  width: number;
  style: number;
  hide?: boolean;
}
