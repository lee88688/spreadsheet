import { h, Component, createRef }  from 'preact';
import Resizer from '../resizer';
import Scrollbar from '../scrollbar';
import styles from './index.scss';
import Editor from '../editor';
import Selector from '../selector';
import DataProxy from '../../core/dataProxy';
import Table from '../table';
import { ElementOffsetSize } from '../index';

interface SheetState {
  data: DataProxy;
  rect: { width: number; height: number }; // the sheet rect size
  offset: ElementOffsetSize;
  verticalScrollBar?: { distance: number; contentDistance: number };
  horizontalScrollBar?: { distance: number; contentDistance: number };
}

export default class Sheet extends Component<any, SheetState>{
  eventMap = new Map()
  canvasRef = createRef<HTMLCanvasElement>()
  table: Table | null = null

  constructor(props: unknown) {
    super(props);
    this.state = {
      data: new DataProxy('sheet1', {} as any),
      rect: { width: 0, height: 0 },
      offset: { left: 0, top: 0, width: 0, height: 0 }
    };
    // this.table = new Table(this.canvasRef, this.state.data);
  }

  componentDidMount() {
    this.table = new Table(this.canvasRef.current as HTMLCanvasElement, this.state.data);
    this.reset();
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
      <div className={styles.sheet}>
        <canvas ref={this.canvasRef} className={styles.table} style={rectStyle}/>
        <div class={styles.overlay} style={rectStyle}>
          <div className={styles.overlayContent} style={offsetStyle}>
            <Editor visible={false}/>
            <Selector/>
          </div>
        </div>
        <Resizer visible={false} direction="horizontal" minDistance={0}/>
        <Resizer visible={false} direction="vertical" minDistance={0}/>
        <Scrollbar
          direction="vertical"
          distance={this.state.verticalScrollBar?.distance ?? 0}
          contentDistance={this.state.verticalScrollBar?.contentDistance ?? 0}
        />
        <Scrollbar
          direction="horizontal"
          distance={this.state.horizontalScrollBar?.distance ?? 0}
          contentDistance={this.state.horizontalScrollBar?.contentDistance ?? 0}
        />
      </div>
    );
  }
}
