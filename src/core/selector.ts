import { CellRange } from './cellRange';
import { SelectorType } from '../components/selector';

interface SelectorItem {
  key: string;
  visible: boolean;
  type: SelectorType;
  range: CellRange;
}

export default class Selector {
  visible: boolean
  range: CellRange
  ri: number
  ci: number
  selectors: SelectorItem[] = []

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

  addNewSelector(item: SelectorItem) {
    if (this.hasSelector(item.key)) {
      console.warn('add existing item is not allowed.');
      return;
    }
    this.selectors.push(item);
  }

  removeSelector(item: SelectorItem) {
    const index = this.selectors.findIndex(({ key }) => item.key === key);
    if (index >= 0) {
      this.selectors.splice(index, 1);
    }
  }

  hasSelector(key: string) {
    return this.selectors.some(({ key: sKey }) => sKey === key);
  }
}
