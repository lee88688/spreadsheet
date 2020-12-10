import helper from './helper';
import { expr2expr } from './alphabet';
import { CellRange } from './cellRange';
import { Cell, Cells, Row } from './index';

export type DeleteCellType = 'all' | 'text' | 'format' | 'merge';
export type CopyCellType = 'all' | 'format' | 'text';
type RowsDataType = { [key: number]: Row };

export class Rows {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _: RowsDataType
  len: number
  height: number

  constructor({ len, height }: { len: number; height: number }) {
    this._ = {};
    this.len = len;
    // default row height
    this.height = height;
  }

  getHeight(ri: number) {
    if (this.isHide(ri)) return 0;
    const row = this.get(ri);
    if (row && row.height) {
      return row.height;
    }
    return this.height;
  }

  setHeight(ri: number, v: number) {
    const row = this.getOrNew(ri);
    row.height = v;
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

  isHide(ri: number) {
    const row = this.get(ri);
    return row && row.hide;
  }

  setHide(ri: number, v: boolean) {
    const row = this.getOrNew(ri);
    if (v === true) row.hide = true;
    else delete row.hide;
  }

  setStyle(ri: number, style: number) {
    const row = this.getOrNew(ri);
    row.style = style;
  }

  sumHeight(min: number, max: number, exceptSet?: Set<number>) {
    return helper.rangeSum(min, max, (i) => {
      if (exceptSet && exceptSet.has(i)) return 0;
      return this.getHeight(i);
    });
  }

  totalHeight() {
    return this.sumHeight(0, this.len);
  }

  get(ri: number) {
    return this._[ri];
  }

  getOrNew(ri: number) {
    this._[ri] = this._[ri] || { cells: {} };
    return this._[ri];
  }

  getCell(ri: number, ci: number) {
    const row = this.get(ri);
    if (row !== undefined && row.cells !== undefined && row.cells[ci] !== undefined) {
      return row.cells[ci];
    }
    return null;
  }

  getCellMerge(ri: number, ci: number) {
    const cell = this.getCell(ri, ci);
    if (cell && cell.merge) return cell.merge;
    return [0, 0];
  }

  getCellOrNew(ri: number, ci: number) {
    const row = this.getOrNew(ri);
    row.cells[ci] = row.cells[ci] || {};
    return row.cells[ci];
  }

  // what: all | text | format
  setCell(ri: number, ci: number, cell: Cell, what: 'all' | 'text' | 'format' = 'all') {
    const row = this.getOrNew(ri);
    if (what === 'all') {
      row.cells[ci] = cell;
    } else if (what === 'text') {
      row.cells[ci] = row.cells[ci] || {};
      row.cells[ci].text = cell.text;
    } else if (what === 'format') {
      row.cells[ci] = row.cells[ci] || {};
      row.cells[ci].style = cell.style;
      if (cell.merge) row.cells[ci].merge = cell.merge;
    }
  }

  setCellText(ri: number, ci: number, text: string) {
    const cell = this.getCellOrNew(ri, ci);
    cell.text = text;
  }

  // what: all | format | text
  copyPaste(
    srcCellRange: CellRange,
    dstCellRange: CellRange,
    what: CopyCellType,
    autofill = false,
    cb: (nri: number, nci: number, ncell: Cell) => void = () => null
  ) {
    const {
      sri, sci, eri, eci,
    } = srcCellRange;
    const dsri = dstCellRange.sri;
    const dsci = dstCellRange.sci;
    const deri = dstCellRange.eri;
    const deci = dstCellRange.eci;
    const [rn, cn] = srcCellRange.size();
    const [drn, dcn] = dstCellRange.size();
    // console.log(srcIndexes, dstIndexes);
    let isAdd = true;
    let dn = 0;
    if (deri < sri || deci < sci) {
      isAdd = false;
      if (deri < sri) dn = drn;
      else dn = dcn;
    }
    for (let i = sri; i <= eri; i += 1) {
      if (this._[i]) {
        for (let j = sci; j <= eci; j += 1) {
          if (this._[i].cells && this._[i].cells[j]) {
            for (let ii = dsri; ii <= deri; ii += rn) {
              for (let jj = dsci; jj <= deci; jj += cn) {
                const nri = ii + (i - sri);
                const nci = jj + (j - sci);
                const ncell = helper.cloneDeep(this._[i].cells[j]);
                // ncell.text
                if (autofill && ncell && ncell.text && ncell.text.length > 0) {
                  const { text } = ncell;
                  let n = (jj - dsci) + (ii - dsri) + 2;
                  if (!isAdd) {
                    n -= dn + 1;
                  }
                  if (text[0] === '=') {
                    ncell.text = text.replace(/[a-zA-Z]{1,3}\d+/g, (word) => {
                      let [xn, yn] = [0, 0];
                      if (sri === dsri) {
                        xn = n - 1;
                        // if (isAdd) xn -= 1;
                      } else {
                        yn = n - 1;
                      }
                      if (/^\d+$/.test(word)) return word;
                      return expr2expr(word, xn, yn);
                    });
                  } else if ((rn <= 1 && cn > 1 && (dsri > eri || deri < sri))
                    || (cn <= 1 && rn > 1 && (dsci > eci || deci < sci))
                    || (rn <= 1 && cn <= 1)) {
                    const result = /[\\.\d]+$/.exec(text);
                    // console.log('result:', result);
                    if (result !== null) {
                      const index = Number(result[0]) + n - 1;
                      ncell.text = text.substring(0, result.index) + index;
                    }
                  }
                }
                this.setCell(nri, nci, ncell, what);
                cb(nri, nci, ncell);
              }
            }
          }
        }
      }
    }
  }

  cutPaste(srcCellRange: CellRange, dstCellRange: CellRange) {
    const ncellmm: RowsDataType = {};
    this.each((ri) => {
      this.eachCells(ri, (ci) => {
        let nri = ri;
        let nci = ci;
        if (srcCellRange.includes(ri, ci)) {
          nri = dstCellRange.sri + (nri - srcCellRange.sri);
          nci = dstCellRange.sci + (nci - srcCellRange.sci);
        }
        ncellmm[nri] = ncellmm[nri] || { cells: {} };
        ncellmm[nri].cells[nci] = this._[ri].cells[ci];
      });
    });
    this._ = ncellmm;
  }

  // src: Array<Array<String>>
  paste(src: string[][], dstCellRange: CellRange) {
    if (src.length <= 0) return;
    const { sri, sci } = dstCellRange;
    src.forEach((row, i) => {
      const ri = sri + i;
      row.forEach((cell, j) => {
        const ci = sci + j;
        this.setCellText(ri, ci, cell);
      });
    });
  }

  insert(sri: number, n = 1) {
    const ndata: RowsDataType = {};
    this.each((ri, row) => {
      let nri = ri;
      if (nri >= sri) {
        nri += n;
        this.eachCells(ri, (ci, cell) => {
          if (cell.text && cell.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, word => expr2expr(word, 0, n, (x, y) => y >= sri));
          }
        });
      }
      ndata[nri] = row;
    });
    this._ = ndata;
    this.len += n;
  }

  delete(sri: number, eri: number) {
    const n = eri - sri + 1;
    const ndata: RowsDataType = {};
    this.each((ri, row) => {
      const nri = ri;
      if (nri < sri) {
        ndata[nri] = row;
      } else if (ri > eri) {
        ndata[nri - n] = row;
        this.eachCells(ri, (ci, cell) => {
          if (cell.text && cell.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, word => expr2expr(word, 0, -n, (x, y) => y > eri));
          }
        });
      }
    });
    this._ = ndata;
    this.len -= n;
  }

  insertColumn(sci: number, n = 1) {
    this.each((ri: number, row) => {
      const rndata: { [key: number]: Cell } = {};
      this.eachCells(ri, (ci, cell) => {
        let nci = ci;
        if (nci >= sci) {
          nci += n;
          if (cell.text && cell.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, word => expr2expr(word, n, 0, x => x >= sci));
          }
        }
        rndata[nci] = cell;
      });
      row.cells = rndata;
    });
  }

  deleteColumn(sci: number, eci: number) {
    const n = eci - sci + 1;
    this.each((ri, row) => {
      const rndata: Cells = {};
      this.eachCells(ri, (ci, cell) => {
        const nci = ci;
        if (nci < sci) {
          rndata[nci] = cell;
        } else if (nci > eci) {
          rndata[nci - n] = cell;
          if (cell.text && cell.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, word => expr2expr(word, -n, 0, x => x > eci));
          }
        }
      });
      row.cells = rndata;
    });
  }

  // what: all | text | format | merge
  deleteCells(cellRange: CellRange, what: DeleteCellType = 'all') {
    cellRange.each((i, j) => {
      this.deleteCell(i, j, what);
    });
  }

  // what: all | text | format | merge
  deleteCell(ri: number, ci: number, what: DeleteCellType = 'all') {
    const row = this.get(ri);
    if (row !== null) {
      const cell = this.getCell(ri, ci);
      if (cell !== null) {
        if (what === 'all') {
          delete row.cells[ci];
        } else if (what === 'text') {
          if (cell.text) delete cell.text;
          if (cell.value) delete cell.value;
        } else if (what === 'format') {
          if (cell.style !== undefined) delete cell.style;
          if (cell.merge) delete cell.merge;
        } else if (what === 'merge') {
          if (cell.merge) delete cell.merge;
        }
      }
    }
  }

  maxCell() {
    const keys = Object.keys(this._);
    const ri = keys[keys.length - 1];
    const col = this._[Number(ri)];
    if (col) {
      const { cells } = col;
      const ks = Object.keys(cells);
      const ci = ks[ks.length - 1];
      return [parseInt(ri, 10), parseInt(ci, 10)];
    }
    return [0, 0];
  }

  each(cb: (ri: number, row: Row) => void) {
    Object.entries(this._).forEach(([ri, row]) => {
      cb(Number(ri), row);
    });
  }

  eachCells(ri: number, cb: (ci: number, cell: Cell) => void) {
    if (this._[ri] && this._[ri].cells) {
      Object.entries(this._[ri].cells).forEach(([ci, cell]) => {
        cb(Number(ci), cell);
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData(d: any) {
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d as RowsDataType;
  }

  getData() {
    const { len } = this;
    return Object.assign({ len }, this._);
  }
}
