import { ResizerDirectionType } from './resizer';

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
  ResizerResize = 'resizer.resize'
}
