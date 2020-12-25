import { ResizerDirectionType } from './resizer';
import { ScrollbarDirectionType } from './scrollbar';
import { CellRange } from '../core/cellRange';

export interface ElementOffsetSize {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ResizerVisibleEventParams {
  direction: ResizerDirectionType;
  visible: boolean;
  unhideVisible?: boolean;
  unhideIndex?: number;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  line?: { width: number; height: number };
  ri?: number;
  ci?: number;
}

export interface ResizerResizeEventParams {
  type: 'start' | 'end';
  direction: ResizerDirectionType;
  distance?: number;
  ri?: number;
  ci?: number;
}

export interface ScrollEventParams {
  direction: ScrollbarDirectionType;
  scrollTop?: number;
  scrollLeft?: number;
}

export interface ScrollSheetEventParams {
  direction: ScrollbarDirectionType;
  // when move down this is positive, otherwise negative
  verticalDelta: number;
  horizontalDelta: number;
}

export interface CellSelectingEventParams {
  visible: boolean;
  range: CellRange;
}

export interface EditorVisibleEventParams {
  visible: boolean;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export enum EventTypes {
  // resizer
  /**
   *  ResizerVisibleEventParams
   * @example emit(EventTypes.ResizerVisible, { direction: 'vertical', visible: true, unhideVisible: false })
   */
  ResizerVisible = 'resizer.visible',
  /**
   *  ResizerResizeEventParams
   */
  ResizerResize = 'resizer.resize',

  // scroll
  /**
   *  ScrollEventParams
   */
  Scroll = 'scroll',
  /**
   *  ScrollSheetEventParams
   */
  ScrollSheet = 'scroll.sheet',

  // cell
  /**
   *  CellSelectingEventParams
   */
  CellSelecting = 'cell.selecting',
  CellSelected = 'cell.selected',
  CellAutofill = 'cell.autofill',

  // context menu
  ContextMenuVisible = 'contextmenu.visible',

  // editor
  /**
   *  EditorVisibleEventParams
   */
  EditorVisible = 'editor.visible',

  // table
  TableRender = 'table.render'
}
