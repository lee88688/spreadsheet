import { CellRange } from './cellRange';

export default class Clipboard {
  range: CellRange | null
  state: 'clear' | 'copy' | 'cut'

  constructor() {
    this.range = null; // CellRange
    this.state = 'clear';
  }

  copy(cellRange: CellRange) {
    this.range = cellRange;
    this.state = 'copy';
    return this;
  }

  cut(cellRange: CellRange) {
    this.range = cellRange;
    this.state = 'cut';
    return this;
  }

  isCopy() {
    return this.state === 'copy';
  }

  isCut() {
    return this.state === 'cut';
  }

  isClear() {
    return this.state === 'clear';
  }

  clear() {
    this.range = null;
    this.state = 'clear';
  }
}
