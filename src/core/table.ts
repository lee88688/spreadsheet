/* eslint-disable @typescript-eslint/no-explicit-any */
import { Draw, DrawBox, npx, thinLineWidth } from '../canvas/draw';
import DataProxy from './dataProxy';
import { cellRender } from './cell';
import { formatm } from './format';
import { formulam } from './formula';
import { CellRange } from './cellRange';
import { getFontSizePxByPt } from './font';
import { stringAt } from './alphabet';

const cellPaddingWidth = 5;
const tableFixedHeaderCleanStyle = { fillStyle: '#f4f5f8' };
const tableGridStyle = {
  fillStyle: '#fff',
  lineWidth: thinLineWidth,
  strokeStyle: '#e6e6e6',
};

function tableFixedHeaderStyle() {
  return {
    textAlign: 'center',
    textBaseline: 'middle',
    font: `500 ${npx(12)}px Source Sans Pro`,
    fillStyle: '#585757',
    lineWidth: thinLineWidth(),
    strokeStyle: '#e6e6e6',
  };
}

function getDrawBox(data: DataProxy, rindex: number, cindex: number, yoffset = 0) {
  const {
    left, top, width, height,
  } = data.cellRect(rindex, cindex);
  return new DrawBox(left, top + yoffset, width, height, cellPaddingWidth);
}

export function renderCell(draw: Draw, data: DataProxy, rindex: number, cindex: number, yoffset = 0) {
  const { sortedRowMap, rows, cols } = data;
  if (rows.isHide(rindex) || cols.isHide(cindex)) return;
  let nrindex = rindex;
  if (sortedRowMap.has(rindex)) {
    nrindex = sortedRowMap.get(rindex);
  }

  const cell = data.getCell(nrindex, cindex);
  if (cell === null) return;
  let frozen = false;
  if ('editable' in cell && cell.editable === false) {
    frozen = true;
  }

  const style = data.getCellStyleOrDefault(nrindex, cindex);
  const dbox = getDrawBox(data, rindex, cindex, yoffset);
  dbox.bgcolor = style.bgcolor;
  if (style.border !== undefined) {
    dbox.setBorders(style.border);
    // bboxes.push({ ri: rindex, ci: cindex, box: dbox });
    draw.strokeBorders(dbox);
  }
  draw.rect(dbox, () => {
    // render text
    let cellText = cellRender(cell.text || '', formulam, (y: number, x: number) => (data.getCellTextOrDefault(x, y)));
    if (style.format) {
      // console.log(data.formatm, '>>', cell.format);
      cellText = (formatm[style.format] as any).render(cellText);
    }
    const font = Object.assign({}, style.font);
    font.size = getFontSizePxByPt(font.size);
    // console.log('style:', style);
    draw.text(cellText, dbox, {
      align: style.align,
      valign: style.valign,
      font,
      color: style.color,
      strike: style.strike,
      underline: style.underline,
    }, style.textwrap);
    // error
    // const error = data.validations.getError(rindex, cindex);
    // if (error) {
    //   draw.error(dbox);
    // }
    if (frozen) {
      draw.frozen(dbox);
    }
  });
}

export default class Table {
  el: HTMLCanvasElement
  draw: Draw
  data: DataProxy

  constructor(el: HTMLCanvasElement, data: DataProxy) {
    this.el = el;
    this.draw = new Draw(el, data.viewWidth(), data.viewHeight());
    this.data = data;
  }

  private renderAutofilter(viewRange: CellRange) {
    const { data, draw } = this;
    if (viewRange) {
      const { autoFilter } = data;
      if (!autoFilter.active()) return;
      const afRange = autoFilter.hrange();
      if (viewRange.intersects(afRange)) {
        afRange.each((ri, ci) => {
          const dbox = getDrawBox(data, ri, ci);
          draw.dropdown(dbox);
        });
      }
    }
  }

  private renderContent(viewRange: CellRange, fw: number, fh: number, tx: number, ty: number) {
    const { draw, data } = this;
    draw.save();
    draw.translate(fw, fh)
      .translate(tx, ty);

    const { exceptRowSet } = data;
    // const exceptRows = Array.from(exceptRowSet);
    const filteredTranslateFunc = (ri: number) => {
      const ret = exceptRowSet.has(ri);
      if (ret) {
        const height = data.rows.getHeight(ri);
        draw.translate(0, -height);
      }
      return !ret;
    };

    const exceptRowTotalHeight = data.exceptRowTotalHeight(viewRange.sri, viewRange.eri);
    // 1 render cell
    draw.save();
    draw.translate(0, -exceptRowTotalHeight);
    viewRange.each((ri, ci) => {
      renderCell(draw, data, ri, ci);
    }, ri => filteredTranslateFunc(ri));
    draw.restore();


    // 2 render mergeCell
    const rset = new Set();
    draw.save();
    draw.translate(0, -exceptRowTotalHeight);
    data.eachMergesInView(viewRange, ({ sri, sci, eri }) => {
      if (!exceptRowSet.has(sri)) {
        renderCell(draw, data, sri, sci);
      } else if (!rset.has(sri)) {
        rset.add(sri);
        const height = data.rows.sumHeight(sri, eri + 1);
        draw.translate(0, -height);
      }
    });
    draw.restore();

    // 3 render autofilter
    this.renderAutofilter(viewRange);

    draw.restore();
  }

  // viewRange
  // type: all | left | top
  // w: the fixed width of header
  // h: the fixed height of header
  // tx: moving distance on x-axis
  // ty: moving distance on y-axis
  private renderFixedHeaders(type: 'all' | 'left' | 'top', viewRange: CellRange, w: number, h: number, tx: number, ty: number) {
    const { draw, data } = this;
    const sumHeight = viewRange.h; // rows.sumHeight(viewRange.sri, viewRange.eri + 1);
    const sumWidth = viewRange.w; // cols.sumWidth(viewRange.sci, viewRange.eci + 1);
    const nty = ty + h;
    const ntx = tx + w;

    draw.save();
    // draw rect background
    draw.attr(tableFixedHeaderCleanStyle);
    if (type === 'all' || type === 'left') draw.fillRect(0, nty, w, sumHeight);
    if (type === 'all' || type === 'top') draw.fillRect(ntx, 0, sumWidth, h);

    const {
      sri, sci, eri, eci,
    } = data.selector.range;
    // console.log(data.selectIndexes);
    // draw text
    // text font, align...
    draw.attr(tableFixedHeaderStyle());
    // y-header-text
    if (type === 'all' || type === 'left') {
      data.rowEach(viewRange.sri, viewRange.eri, (i, y1, rowHeight) => {
        const y = nty + y1;
        const ii = i;
        draw.line([0, y], [w, y]);
        if (sri <= ii && ii < eri + 1) {
          this.renderSelectedHeaderCell(0, y, w, rowHeight);
        }
        draw.fillText(`${ii +1}`, w / 2, y + (rowHeight / 2));
        if (i > 0 && data.rows.isHide(i - 1)) {
          draw.save();
          draw.attr({ strokeStyle: '#c6c6c6' });
          draw.line([5, y + 5], [w - 5, y + 5]);
          draw.restore();
        }
      });
      draw.line([0, sumHeight + nty], [w, sumHeight + nty]);
      draw.line([w, nty], [w, sumHeight + nty]);
    }
    // x-header-text
    if (type === 'all' || type === 'top') {
      data.colEach(viewRange.sci, viewRange.eci, (i, x1, colWidth) => {
        const x = ntx + x1;
        const ii = i;
        draw.line([x, 0], [x, h]);
        if (sci <= ii && ii < eci + 1) {
          this.renderSelectedHeaderCell(x, 0, colWidth, h);
        }
        draw.fillText(stringAt(ii), x + (colWidth / 2), h / 2);
        if (i > 0 && data.cols.isHide(i - 1)) {
          draw.save();
          draw.attr({ strokeStyle: '#c6c6c6' });
          draw.line([x + 5, 5], [x + 5, h - 5]);
          draw.restore();
        }
      });
      draw.line([sumWidth + ntx, 0], [sumWidth + ntx, h]);
      draw.line([0, h], [sumWidth + ntx, h]);
    }
    draw.restore();
  }

  private renderSelectedHeaderCell(x: number, y: number, w: number, h: number) {
    const { draw } = this;
    draw.save();
    draw.attr({ fillStyle: 'rgba(75, 137, 255, 0.08)' })
      .fillRect(x, y, w, h);
    draw.restore();
  }

  private renderFixedLeftTopCell(fw: number, fh: number) {
    const { draw } = this;
    draw.save();
    // left-top-cell
    draw.attr({ fillStyle: '#f4f5f8' })
      .fillRect(0, 0, fw, fh);
    draw.restore();
  }

  private renderContentGrid(
    { sri, sci, eri, eci, w, h, }: CellRange,
    fw: number, fh: number, tx: number, ty: number
  ) {
    const { draw, data } = this;
    const { settings } = data;

    draw.save();
    draw.attr(tableGridStyle)
      .translate(fw + tx, fh + ty);
    // const sumWidth = cols.sumWidth(sci, eci + 1);
    // const sumHeight = rows.sumHeight(sri, eri + 1);
    // console.log('sumWidth:', sumWidth);
    draw.clearRect(0, 0, w, h);
    if (!settings.showGrid) {
      draw.restore();
      return;
    }
    // console.log('rowStart:', rowStart, ', rowLen:', rowLen);
    data.rowEach(sri, eri, (i, y, ch) => {
      // console.log('y:', y);
      if (i !== sri) draw.line([0, y], [w, y]);
      if (i === eri) draw.line([0, y + ch], [w, y + ch]);
    });
    data.colEach(sci, eci, (i, x, cw) => {
      if (i !== sci) draw.line([x, 0], [x, h]);
      if (i === eci) draw.line([x + cw, 0], [x + cw, h]);
    });
    draw.restore();
  }

  private renderFreezeHighlightLine(fw: number, fh: number, ftw: number, fth: number) {
    const { draw, data } = this;
    const twidth = data.viewWidth() - fw;
    const theight = data.viewHeight() - fh;
    draw.save()
      .translate(fw, fh)
      .attr({ strokeStyle: 'rgba(75, 137, 255, .6)' });
    draw.line([0, fth], [twidth, fth]);
    draw.line([ftw, 0], [ftw, theight]);
    draw.restore();
  }

  resetData(data: DataProxy) {
    this.data = data;
    this.render();
  }

  render() {
    // resize canvas
    const { data } = this;
    const { rows, cols } = data;
    // fixed width of header
    const fw = cols.indexWidth;
    // fixed height of header
    const fh = rows.height;

    this.draw.resize(data.viewWidth(), data.viewHeight());
    this.clear();

    const viewRange = data.viewRange();
    // renderAll.call(this, viewRange, data.scroll);
    const tx = data.freezeTotalWidth();
    const ty = data.freezeTotalHeight();
    const { x, y } = data.scroll;
    // 1
    this.renderContentGrid(viewRange, fw, fh, tx, ty);
    this.renderContent(viewRange, fw, fh, -x, -y);
    this.renderFixedHeaders('all', viewRange, fw, fh, tx, ty);
    this.renderFixedLeftTopCell(fw, fh);
    const [fri, fci] = data.freeze;
    if (fri > 0 || fci > 0) {
      // 2
      if (fri > 0) {
        const vr = viewRange.clone();
        vr.sri = 0;
        vr.eri = fri - 1;
        vr.h = ty;
        this.renderContentGrid(vr, fw, fh, tx, 0);
        this.renderContent(vr, fw, fh, -x, 0);
        this.renderFixedHeaders('top', vr, fw, fh, tx, 0);
      }
      // 3
      if (fci > 0) {
        const vr = viewRange.clone();
        vr.sci = 0;
        vr.eci = fci - 1;
        vr.w = tx;
        this.renderContentGrid(vr, fw, fh, 0, ty);
        this.renderFixedHeaders('left', vr, fw, fh, 0, ty);
        this.renderContent(vr, fw, fh, 0, -y);
      }
      // 4
      const freezeViewRange = data.freezeViewRange();
      this.renderContentGrid(freezeViewRange, fw, fh, 0, 0);
      this.renderFixedHeaders('all', freezeViewRange, fw, fh, 0, 0);
      this.renderContent(freezeViewRange, fw, fh, 0, 0);
      // 5
      this.renderFreezeHighlightLine(fw, fh, tx, ty);
    }
  }

  clear() {
    this.draw.clear();
  }
}
