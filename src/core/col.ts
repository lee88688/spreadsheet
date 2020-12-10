import helper from './helper';
import { Col } from './index';

type ColsDataType = { [key: number]: Col }

export class Cols {
  _: ColsDataType
  len: number
  width: number
  indexWidth: number
  minWidth: number

  constructor({ len, width, indexWidth, minWidth }: { len: number; width: number; indexWidth: number; minWidth: number}) {
    this._ = {};
    this.len = len;
    this.width = width;
    this.indexWidth = indexWidth;
    this.minWidth = minWidth;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData(d: any) {
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d as ColsDataType;
  }

  getData() {
    const { len } = this;
    return Object.assign({ len }, this._);
  }

  getWidth(i: number) {
    if (this.isHide(i)) return 0;
    const col = this._[i];
    if (col && col.width) {
      return col.width;
    }
    return this.width;
  }

  getOrNew(ci: number) {
    this._[ci] = this._[ci] || {};
    return this._[ci];
  }

  setWidth(ci: number, width: number) {
    const col = this.getOrNew(ci);
    col.width = width;
  }

  unhide(idx: number) {
    let index = idx;
    while (index > 0) {
      index -= 1;
      if (this.isHide(index)) {
        this.setHide(index, false);
      } else break;
    }
  }

  isHide(ci: number) {
    const col = this._[ci];
    return col && col.hide;
  }

  setHide(ci: number, v: boolean) {
    const col = this.getOrNew(ci);
    if (v === true) col.hide = true;
    else delete col.hide;
  }

  setStyle(ci: number, style: number) {
    const col = this.getOrNew(ci);
    col.style = style;
  }

  sumWidth(min: number, max: number) {
    return helper.rangeSum(min, max, i => this.getWidth(i));
  }

  totalWidth() {
    return this.sumWidth(0, this.len);
  }
}
