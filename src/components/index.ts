import { ResizerDirectionType } from './resizer';
import { ScrollbarDirectionType } from './scrollbar';

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
}

export interface ResizerResizeEventParams {
  type: 'start' | 'end';
  distance?: number;
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

export enum EventTypes {
  // resizer
  /**
   * @event ResizerVisibleEventParams
   * @example emit(EventTypes.ResizerVisible, { direction: 'vertical', visible: true, unhideVisible: false })
   */
  ResizerVisible = 'resizer.visible',
  /**
   * @event ResizerResizeEventParams
   */
  ResizerResize = 'resizer.resize',

  // scroll
  /**
   * @event ScrollEventParams
   */
  Scroll = 'scroll',
  /**
   * @event ScrollSheetEventParams
   */
  ScrollSheet = 'scroll.sheet'
}
