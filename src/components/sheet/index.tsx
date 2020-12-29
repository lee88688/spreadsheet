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
  CellSelectingEventParams, EditorVisibleEventParams,
  ElementOffsetSize,
  EventTypes, ResizerResizeEventParams,
  ResizerVisibleEventParams,
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
}

export const SheetContext = createContext<{ data: DataProxy; events: EventEmitter }>({ data: {} as any, events: {} as EventEmitter });

export default class Sheet extends Component<any, SheetState>{
  events = new EventEmitter()
  canvasRef = createRef<HTMLCanvasElement>()
  containerRef = createRef<HTMLDivElement>()
  table: Table | null = null
  tableRenderRequest: number

  constructor(props: unknown) {
    super(props);

    const data = new DataProxy('sheet1', {
      view: {
        width: () => this.containerRef.current?.clientWidth ?? 0,
        height: () => this.containerRef.current?.clientHeight ?? 0
      }
    } as any);

    this.state = {
      data,
      events: this.events,
      rect: { width: 0, height: 0 },
      offset: { left: 0, top: 0, width: 0, height: 0 }
    };
    this.events.on(EventTypes.Scroll, () => this.events.emit(EventTypes.TableRender));
    this.events.on(EventTypes.CellSelecting, () => this.events.emit(EventTypes.TableRender));

    // resizer resize end
    this.events.on(EventTypes.ResizerResize, this.resizerResizeEnd);

    // table render events
    this.tableRenderRequest = 0;
    this.events.on(EventTypes.TableRender, () => {
      if (this.tableRenderRequest === 0) {
        window.requestAnimationFrame(this.tableRenderHandler);
      }
      this.tableRenderRequest++;
    });

    if (process.env.NODE_ENV === 'development') {
      (window as any).events = this.events;
      (window as any).data = this.state.data;
    }
  }

  componentDidMount() {
    this.table = new Table(this.canvasRef.current as HTMLCanvasElement, this.state.data);
    this.reset();
  }

  tableRenderHandler = () => {
    if (this.tableRenderRequest > 0) {
      // console.log('table render', this.tableRenderRequest);
      this.table?.render();
      this.tableRenderRequest = 0;
    }
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
      rowResizerParam.ri = cRect.ri;
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
      colResizerParam.ci = cRect.ci;
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
    this.events.emit(EventTypes.EditorVisible, {
      visible: false,
    } as EditorVisibleEventParams);
    // contextMenu.hide();
    // the left mouse button: mousedown → mouseup → click
    // the right mouse button: mousedown → contenxtmenu → mouseup
    if (e.buttons === 2) {
      // right button click
    } else if (e.detail === 2) {
      // open editor
      this.showEditor(e);
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
      // fixme: offsetX and offsetY relative to window, need translate to sheet top and left
      const { ri, ci } = this.state.data.getCellRectByXY(e.offsetX, e.offsetY);
      // console.log('mousemove', ri, ci, e);
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

  private showEditor(e: MouseEvent) {
    e.stopPropagation();
    const data = this.state.data;
    const sOffset = data.getSelectedRect();
    // const tOffset = this.getTableOffset();
    // decide the suggest position
    // let sPosition = 'top';
    // if (sOffset.top > tOffset.height / 2) {
    //   sPosition = 'bottom';
    // }
    this.events.emit(EventTypes.EditorVisible, {
      visible: true,
      rect: sOffset
    } as EditorVisibleEventParams);
  }

  resizerResizeEnd = (params: ResizerResizeEventParams) => {
    if (params.type === 'end' && params.distance) {
      const isVertical = params.direction === 'vertical';
      let shouldRender = false;
      if (isVertical && params.ci !== undefined) {
        this.state.data.cols.setWidth(params.ci, params.distance);
        shouldRender = true;
      } else if (!isVertical && params.ri !== undefined) {
        this.state.data.rows.setHeight(params.ri, params.distance);
        shouldRender = true;
        // table.render();
        // selector.resetAreaOffset();
        // verticalScrollbarSet.call(this);
        // editorSetOffset.call(this);
      }
      if (shouldRender) {
        this.events.emit(EventTypes.CellSelecting);
        this.events.emit(EventTypes.ScrollDistanceChange);
        this.events.emit(EventTypes.TableRender);
      }
    }
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

    this.events.emit(EventTypes.TableRender);
    setTimeout(() => {
      this.events.emit(EventTypes.ScrollDistanceChange);
    }, 0);
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
        <div ref={this.containerRef} className={styles.sheet}>
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
          <Scrollbar direction={ScrollbarDirectionType.vertical}/>
          <Scrollbar direction={ScrollbarDirectionType.horizontal}/>
        </div>
      </SheetContext.Provider>
    );
  }
}
