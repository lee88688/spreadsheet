import { Component, createContext, createRef, h } from 'preact';
import { EventEmitter } from 'events';
import Resizer, { ResizerDirectionType } from '../resizer';
import Scrollbar, { ScrollbarDirectionType } from '../scrollbar';
import styles from './index.scss';
import Editor from '../editor';
import Selector from '../selector';
import DataProxy from '../../core/dataProxy';
import Table from '../table';
import { ElementOffsetSize, EventTypes, ResizerVisibleEventParams } from '../index';
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
    // this.table = new Table(this.canvasRef, this.state.data);
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
          <div class={styles.overlay} style={rectStyle} onMouseMove={this.resizerMouseMoveHandler}>
            <div className={styles.overlayContent} style={offsetStyle}>
              <Editor visible={false}/>
              <Selector main={this.state.mainSelector}/>
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
