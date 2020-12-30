import { h } from 'preact';
import { useContext, useEffect, useState, useCallback } from 'preact/hooks';
import styles from './index.scss';
import { ElementOffsetSize, EventTypes } from '../index';
import { CellRange } from '../../core/cellRange';
import { SheetContext } from '../sheet';
import { useRender } from '../../core/hooks';

/**
 * selector for default select only
 * area like selector without dot on bottom right
 * inset like copy selector with dash line
 */
export type SelectorType = 'selector' | 'area' | 'inset';

const AUTOFILL_KEY = 'autofill';

interface SelectorElementProps {
  visible: boolean;
  offset?: ElementOffsetSize;
  areaOffset?: ElementOffsetSize;
  type: SelectorType;
  cellRange: CellRange;
}

function SelectorElement(props: SelectorElementProps) {
  const { data, events } = useContext(SheetContext);

  const rect = data.coordinate.cellRange2Rect(props.cellRange);

  let el = null;
  // const ftWidth = data.freezeTotalWidth();
  // const ftHeight = data.freezeTotalHeight();
  const width = rect.width ? rect.width - 4 : 0;
  const height = rect.height ? rect.height - 4 : 0;
  // let left = rect.left - ftWidth;
  // let top = rect.top - ftHeight;
  const style = {
    display: props.visible ? 'block' : 'none',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${width}px`,
    height: `${height}px`
  };
  if (props.type === 'selector') {
    const cornerMouseDown = (e: MouseEvent) => {
      e.stopPropagation();

      const mousemoveHandler = (e: MouseEvent) => {
        const { offsetY, offsetX } = e; // todo: offset is relative overlay not selector
        // console.log('mousemove', offsetX, offsetY);
        const rect = data.coordinate.cellRange2GlobalRect(props.cellRange);
        /**
         * mX, mY is relative to selector's left and top
         * width, height is selector width and height
         * conditions
         * -------------------- outside ---------------------------
         * 1. mY - height > 0 or mX - width > 0 or mY < 0 or mX < 0
         * -------------------- inside ----------------------------
         * 2. mY < height and mX < width and mX > 0 and mY > 0
         */
        let isVertical = true;
        /**
         * autofill will be reverse or not
         * vertical, mY < 0
         * horizontal, mX < 0
         */
        let reverse = false;
        let inside = false;
        let distance = 0;
        const mX = offsetX - rect.left;
        const mY = offsetY - rect.top;
        if (mY > rect.height || mX > rect.width || mY < 0 || mX < 0) {
          //      mX<0, outside |            mX inside | mX>width, outside
          const x = mX < 0 ? mX : (mX < rect.width ? 0 : mX - rect.width);
          // the same
          const y = mY < 0 ? mY : (mY < rect.height ? 0 : mY - rect.height);
          if (Math.abs(x) > Math.abs(y)) {
            isVertical = false;
            distance = x;
            mX < 0 && (reverse = true);
          } else {
            isVertical = true;
            distance = y;
            mY < 0 && (reverse = true);
          }
          // console.log(`left: ${rect.left}, top: ${rect.top}`);
          // console.log(`mX: ${mX}, mY: ${mY}, x: ${x}, y: ${y}`);
        } else {
          // inside
          inside = true;
          if (mX > mY) {
            isVertical = false;
            distance = mX;
          } else {
            isVertical = true;
            distance = mY;
          }
        }

        const range = data.selector.range.clone();
        if (isVertical) {
          const { ri } = data.coordinate.positionX2CellRow(offsetY, data.scroll.y);
          const selectorItem = data.selector.getSelector(AUTOFILL_KEY);
          if (reverse && !inside) {
            range.sri = ri;
          } else {
            range.eri = ri;
          }
          selectorItem && (selectorItem.range = range);
        } else {
          const { ci } = data.coordinate.positionY2CellCol(offsetX, data.scroll.x);
          const selectorItem = data.selector.getSelector(AUTOFILL_KEY);
          console.log('before', selectorItem?.range.toString());
          if (reverse && !inside) {
            range.sci = ci;
          } else {
            range.eci = ci;
          }
          selectorItem && (selectorItem.range = range);
        }
        console.log('after', range.toString(), `inside: ${inside}, reverse: ${reverse}`);
        events.emit(EventTypes.CellSelecting);
      };

      const mouseupHandler = (e: MouseEvent) => {
        window.removeEventListener('mousemove', mousemoveHandler);
        window.removeEventListener('mouseup', mouseupHandler);
        data.selector.removeSelector(AUTOFILL_KEY);
        events.emit(EventTypes.CellSelecting);
        events.emit(EventTypes.CellAutofill);
      };

      const range = data.selector.range.clone();
      data.selector.addNewSelector({
        visible: true,
        key: AUTOFILL_KEY,
        type: 'inset',
        range
      });

      window.addEventListener('mousemove', mousemoveHandler);
      window.addEventListener('mouseup', mouseupHandler);
      events.emit(EventTypes.CellSelecting);
    };
    el = (
      <div className={styles.selectorArea} style={style}>
        <div className={styles.selectorCorner} onMouseDown={cornerMouseDown}/>
      </div>
    );
  } else if (props.type === 'area') {
    el = <div className={styles.selectorArea} style={style}/>;
  } else if (props.type === 'inset') {
    el = <div className={styles.selectorClipboard} style={style}/>;
  }
  return (
    <div className={styles.selector}>
      {el}
      {/*<div className={styles.selectorAutofill}/>*/}
    </div>
  );
}

export default function Selector() {
  const render = useRender();
  const { events, data } = useContext(SheetContext);

  const { visible, range, selectors } = data.selector;

  useEffect(() => {
    const fn = () => render();
    events.on(EventTypes.Scroll, fn);

    return () => {
      events.off(EventTypes.Scroll, fn);
    };
  }, [events, render]);

  useEffect(() => {
    const selecting = () => render();
    events.on(EventTypes.CellSelecting, selecting);

    return () => {
      events.off(EventTypes.CellSelecting, selecting);
    };
  }, [events, render]);

  return (
    <div className={styles.selectors}>
      {selectors?.map((item) =>
        <SelectorElement key={item.key} visible={item.visible} type={item.type} cellRange={item.range}/>)
      }
      <SelectorElement key="_main-selector" visible={visible} type="selector" cellRange={range}/>
    </div>
  );
}
