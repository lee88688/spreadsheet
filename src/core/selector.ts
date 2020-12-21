import { CellRange } from './cellRange';

export default class Selector {
  visible: boolean
  range: CellRange
  ri: number
  ci: number

  constructor() {
    this.visible = false;
    this.range = new CellRange(0, 0, 0, 0);
    this.ri = 0;
    this.ci = 0;
  }

  multiple() {
    return this.range.multiple();
  }

  setIndexes(ri: number, ci: number) {
    this.ri = ri;
    this.ci = ci;
  }

  size() {
    return this.range.size();
  }
}
