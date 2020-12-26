import DataProxy from './dataProxy';
import { CellRange } from './cellRange';
import helper from './helper';

export default class Coordinate {
  data: DataProxy

  constructor(data: DataProxy) {
    this.data = data;
  }

  cellRange2Rect(cellRange: CellRange) {
    return this.data.getRect(cellRange.toForwardDirection());
  }

  /**
   * global is relative to overlayer top left
   * @param cellRange
   */
  cellRange2GlobalRect(cellRange: CellRange) {
    const {
      scroll, rows, cols, exceptRowSet,
    } = this.data;
    const { sri, sci, eri, eci } = cellRange;
    // range is not valid
    if (sri < 0 && sci < 0) {
      return {
        left: 0, top: 0, width: 0, height: 0
      };
    }
    const left = cols.sumWidth(0, sci);
    const top = rows.sumHeight(0, sri, exceptRowSet);
    const height = rows.sumHeight(sri, eri + 1, exceptRowSet);
    const width = cols.sumWidth(sci, eci + 1);
    // without scroll add row and col index
    const left0 = left - scroll.x + cols.indexWidth;
    const top0 = top - scroll.y + rows.height;

    return {
      left: left0,
      top: top0,
      width,
      height
    };
  }

  position2Cell(x: number, y: number) {
    return this.data.getCellRectByXY(x, y);
  }

  /**
   * use offsetY to get row index and height
   * @param y relative to overlayer
   * @param scrollOffsetY
   */
  positionX2CellRow(y: number, scrollOffsetY: number) {
    const { rows } = this.data;
    const fsh = this.data.freezeTotalHeight();
    // console.log('y:', y, ', fsh:', fsh);
    let inits = rows.height;
    if (fsh + rows.height < y) inits -= scrollOffsetY;

    // handle ri in autofilter
    const frset = this.data.exceptRowSet;

    let ri = 0;
    let top = inits;
    let { height } = rows;
    for (; ri < rows.len; ri += 1) {
      if (top > y) break;
      if (!frset.has(ri)) {
        height = rows.getHeight(ri);
        top += height;
      }
    }
    top -= height;
    // console.log('ri:', ri, ', top:', top, ', height:', height);

    if (top <= 0) {
      return { ri: -1, top: 0, height };
    }

    return { ri: ri - 1, top, height };
  }

  /**
   * use offsetX to get col index and width
   * @param x offsetX relative overlayer
   * @param scrollOffsetX
   */
  positionY2CellCol(x: number, scrollOffsetX: number) {
    const { cols } = this.data;
    const fsw = this.data.freezeTotalWidth();
    let inits = cols.indexWidth;
    if (fsw + cols.indexWidth < x) inits -= scrollOffsetX;
    const [ci, left, width] = helper.rangeReduceIf(
      0,
      cols.len,
      inits,
      cols.indexWidth,
      x,
      i => cols.getWidth(i),
    );
    if (left <= 0) {
      return { ci: -1, left: 0, width: cols.indexWidth };
    }
    return { ci: ci - 1, left, width };
  }
}
