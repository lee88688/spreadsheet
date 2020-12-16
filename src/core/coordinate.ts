import DataProxy from './dataProxy';
import { CellRange } from './cellRange';

export default class Coordinate {
  data: DataProxy

  constructor(data: DataProxy) {
    this.data = data;
  }

  cellRange2Rect(cellRange: CellRange) {
    const { left, top, width, height } = this.data.getRect(cellRange);
    return { left, top, width, height };
  }

  position2Cell(x: number, y: number) {
    return this.data.getCellRectByXY(x, y);
  }
}