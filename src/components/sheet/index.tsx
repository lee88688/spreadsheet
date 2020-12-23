import { Component, createContext, createRef, h } from 'preact';
import { EventEmitter } from 'events';
import Resizer, { ResizerDirectionType } from '../resizer';
import Scrollbar, { ScrollbarDirectionType } from '../scrollbar';
import styles from './index.scss';
import Editor from '../editor';
import Selector from '../selector';
import DataProxy from '../../core/dataProxy';
import Table from '../table';
import {
  CellSelectingEventParams,
  ElementOffsetSize,
  EventTypes,
  ResizerVisibleEventParams,
  ScrollEventParams,
  ScrollSheetEventParams
} from '../index';
import { CellRange } from '../../core/cellRange';

interface SheetState {
  data: DataProxy;
  events: EventEmitter;
  rect: { width: number; height: number }; // the sheet rect size
  offset: ElementOffsetSize;
  verticalScrollBar?: { distance: number; contentDistance: number };
  horizontalScrollBar?: { distance: number; contentDistance: number };
  mainSelector: { visible: boolean; cellRange: CellRange };
}

export const SheetContext = createContext<{ data: DataProxy; events: EventEmitter }>({ data: {} as any, events: {} as EventEmitter });

export default class Sheet extends Component<any, SheetState>{
  events = new EventEmitter()
  canvasRef = createRef<HTMLCanvasElement>()
  table: Table | null = null

  constructor(props: unknown) {
    super(props);
    this.state = {
      data: new DataProxy('sheet1', {} as any),
      events: this.events,
      rect: { width: 0, height: 0 },
      offset: { left: 0, top: 0, width: 0, height: 0 },
      mainSelector: { visible: false, cellRange: new CellRange(0,0,0,0) }
    };
    this.events.on(EventTypes.Scroll, () => this.table?.render());
    this.events.on(EventTypes.CellSelecting, () => this.table?.render());
  }

  componentDidMount() {
    this.table = new Table(this.canvasRef.current as HTMLCanvasElement, this.state.data);
    this.reset();
  }

  resizerMouseMoveHandler = (e: MouseEvent) => {
    if (e.buttons !== 0) return;
    const { offsetX, offsetY } = e;
    const { rows, cols } = this.state.data;
    const emitResizerVisibleEvents = (p: ResizerVisibleEventParams) => this.events.emit(EventTypes.ResizerVisible, p);
    if (offsetX > cols.indexWidth && offsetY > rows.height) {
      emitResizerVisibleEvents({ direction: ResizerDirectionType.vertical, visible: false });
      emitResizerVisibleEvents({ direction: ResizerDirectionType.horizontal, visible: false });
      return;
    }
    const tRect = (this.canvasRef.current as HTMLCanvasElement).getBoundingClientRect(); // fixme: relative to parent, not view point
    const cRect = this.state.data.getCellRectByXY(offsetX, offsetY);

    // horizontal
    const rowResizerParam: ResizerVisibleEventParams = {
      direction: ResizerDirectionType.horizontal,
      visible: false
    };
    if (cRect.ri >= 0 && cRect.ci === -1) {
      cRect.width = cols.indexWidth;
      // rowResizer.show(cRect, {
      //   width: tRect.width,
      // });
      rowResizerParam.visible = true;
      rowResizerParam.rect = cRect;
      rowResizerParam.line = { width: tRect.width, height: 0 };
      if (rows.isHide(cRect.ri - 1)) {
        // rowResizer.showUnhide(cRect.ri);
        rowResizerParam.unhideVisible = true;
        rowResizerParam.unhideIndex = cRect.ri;
      } else {
        // rowResizer.hideUnhide();
      }
    } else {
      // rowResizer.hide();
    }
    emitResizerVisibleEvents(rowResizerParam);

    // vertical
    const colResizerParam: ResizerVisibleEventParams = {
      visible: false,
      direction: ResizerDirectionType.vertical
    };
    if (cRect.ri === -1 && cRect.ci >= 0) {
      cRect.height = rows.height;
      // colResizer.show(cRect, {
      //   height: tRect.height,
      // });
      colResizerParam.rect = cRect;
      colResizerParam.line = { height: tRect.height, width: 0 };
      colResizerParam.visible = true;
      if (cols.isHide(cRect.ci - 1)) {
        // colResizer.showUnhide(cRect.ci);
        colResizerParam.unhideVisible = true;
        colResizerParam.unhideIndex = cRect.ci;
      } else {
        // colResizer.hideUnhide();
      }
    } else {
      // colResizer.hide();
    }
    emitResizerVisibleEvents(colResizerParam);
  }

  mouseoutHandler = (e: MouseEvent) => {
    const { offsetX, offsetY } = e;
    if (offsetX <= 0) this.events.emit(EventTypes.ResizerVisible, { visible: false, direction: ResizerDirectionType.vertical } as ResizerVisibleEventParams);
    if (offsetY <= 0) this.events.emit(EventTypes.ResizerVisible, { visible: false, direction: ResizerDirectionType.horizontal } as ResizerVisibleEventParams);
  }

  mouseScrollHandler = (e: WheelEvent) => {
    e.stopPropagation();

    const { data } = this.state;
    const { rows, cols } = this.state.data;

    const { deltaY, deltaX, shiftKey } = e;

    const params: ScrollSheetEventParams = {
      direction: shiftKey ? ScrollbarDirectionType.horizontal : ScrollbarDirectionType.vertical,
      horizontalDelta: deltaX,
      verticalDelta: 0
    };
    if (shiftKey) {
      params.horizontalDelta = deltaY;
    } else {
      params.verticalDelta = deltaY;
    }
    // this.events.emit(EventTypes.ScrollSheet, params);

    // fixme: why value maybe negative
    const loopValue = (index: number, vFunc: (i: number) => number) => {
      let value = 0;
      for (let i = index; value <= 0; i++) {
        value = vFunc(i);
      }
      return value;
    };

    const moveY = (vertical: number) => {
      let rh = 0;
      if (vertical > 0) {
        // move down, increase row
        const ri = data.scroll.ri + 1;
        if (ri < rows.len) {
          rh = loopValue(ri, i => rows.getHeight(i));
        }
      } else {
        // move up, decrease row
        const ri = data.scroll.ri - 1;
        if (ri >= 0) {
          rh = -loopValue(ri, i => rows.getHeight(i)); // scroll to top
        }
      }
      // console.log(`rh: ${rh}`);
      params.verticalDelta = rh;
      this.events.emit(EventTypes.ScrollSheet, params);
    };

    const moveX = (horizontal: number) => {
      let cw = 0;
      if (horizontal > 0) {
        // move right, increase col
        const ci = data.scroll.ci + 1;
        if (ci < cols.len) {
          cw = loopValue(ci, i => cols.getWidth(i));
        }
      } else {
        // move left, decrease col
        const ci = data.scroll.ci - 1;
        if (ci >= 0) {
          cw = -loopValue(ci, i => cols.getWidth(i)); // scroll to left
        }
      }
      params.horizontalDelta = cw;
      this.events.emit(EventTypes.ScrollSheet, params);
    };

    const tempY = Math.abs(params.verticalDelta);
    const tempX = Math.abs(params.horizontalDelta);
    const temp = Math.max(tempY, tempX);

    if (temp === tempX) moveX(params.horizontalDelta);
    if (temp === tempY) moveY(params.verticalDelta);
  }

  mousedownHandler = (e: MouseEvent) => {
    // editor.clear();
    // contextMenu.hide();
    // the left mouse button: mousedown → mouseup → click
    // the right mouse button: mousedown → contenxtmenu → mouseup
    if (e.buttons === 2) {
      // right button click
    } else if (e.detail === 2) {
      // open editor
    } else {
      // selector
      this.overlayerMouseDown(e);
    }
  }

  private overlayerMouseDown(e: MouseEvent) {
    // fixme: remove auto fill select
    const { offsetX, offsetY } = e;
    const cellRect = this.state.data.getCellRectByXY(offsetX, offsetY);
    const range = new CellRange(cellRect.ri, cellRect.ci, cellRect.ri, cellRect.ci);

    const mousemove = (e: MouseEvent) => {
      const { data } = this.state;
      const { ri, ci } = this.state.data.getCellRectByXY(e.offsetX, e.offsetY);
      console.log('mousemove', ri, ci, e);
      const cellRange = new CellRange(cellRect.ri, cellRect.ci, ri, ci);
      if (data.selector.range.equals(cellRange)) {
        return;
      }
      data.selector.range = cellRange;
      data.selector.visible = true;
      this.events.emit(EventTypes.CellSelecting, { visible: true, range: cellRange } as CellSelectingEventParams);
    };

    const mouseup = (e: MouseEvent) => {
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
      this.events.emit(EventTypes.CellSelected, this.state.data.selector.range);
    };

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
    const { data } = this.state;
    data.selector.visible = true;
    data.selector.range = range;
    this.events.emit(EventTypes.CellSelecting, { range: range, visible: true } as CellSelectingEventParams);
  }

  private reset() {
    const rect = this.getRect();
    const offset = this.getTableOffset();
    const colResizerHeight = this.state.data.exceptRowTotalHeight(0, -1);
    const totalHeight = this.state.data.rows.totalHeight();
    const totalWidth = this.state.data.cols.totalWidth();
    this.setState({
      rect,
      offset,
      verticalScrollBar: { distance: offset.height, contentDistance: totalHeight - colResizerHeight },
      horizontalScrollBar: { distance: offset.width, contentDistance: totalWidth }
    });

    this.table?.render();
  }

  getRect() {
    return { width: this.state.data.viewWidth(), height: this.state.data.viewHeight() };
  }

  getTableOffset() {
    const { rows, cols } = this.state.data;
    const { width, height } = this.getRect();
    return {
      width: width - cols.indexWidth,
      height: height - rows.height,
      left: cols.indexWidth,
      top: rows.height,
    };
  }

  render() {
    const rectStyle = {
      width: `${this.state.rect.width}px`,
      height: `${this.state.rect.height}px`
    };
    const offsetStyle = {
      left: `${this.state.offset.left}px`,
      top: `${this.state.offset.top}px`,
      width: `${this.state.offset.width}px`,
      height: `${this.state.offset.height}px`
    };

    return (
      <SheetContext.Provider value={this.state}>
        <div className={styles.sheet}>
          <canvas ref={this.canvasRef} className={styles.table} style={rectStyle}/>
          <div
            class={styles.overlay}
            style={rectStyle}
            onMouseMove={this.resizerMouseMoveHandler}
            onMouseOut={this.mouseoutHandler}
            onWheel={this.mouseScrollHandler}
            onMouseDown={this.mousedownHandler}
          >
            <div className={styles.overlayContent} style={offsetStyle}>
              <Editor visible={false}/>
              <Selector/>
            </div>
          </div>
          <Resizer direction={ResizerDirectionType.horizontal} minDistance={0}/>
          <Resizer direction={ResizerDirectionType.vertical} minDistance={0}/>
          <Scrollbar
            direction={ScrollbarDirectionType.vertical}
            distance={this.state.verticalScrollBar?.distance ?? 0}
            contentDistance={this.state.verticalScrollBar?.contentDistance ?? 0}
          />
          <Scrollbar
            direction={ScrollbarDirectionType.horizontal}
            distance={this.state.horizontalScrollBar?.distance ?? 0}
            contentDistance={this.state.horizontalScrollBar?.contentDistance ?? 0}
          />
        </div>
      </SheetContext.Provider>
    );
  }
}
