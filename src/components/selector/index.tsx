import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import styles from './index.scss';
import { CellSelectingEventParams, ElementOffsetSize, EventTypes } from '../index';
import { CellRange } from '../../core/cellRange';
import { SheetContext } from '../sheet';
import { useRender } from '../../core/hooks';

/**
 * selector for default select only
 * area like selector without dot on bottom right
 * inset like copy selector with dash line
 */
type SelectorType = 'selector' | 'area' | 'inset';

interface SelectorElementProps {
  visible: boolean;
  offset?: ElementOffsetSize;
  areaOffset?: ElementOffsetSize;
  type: SelectorType;
  cellRange: CellRange;
}

interface SelectorProps {
  selectors?: { key: string; visible: boolean; type: SelectorType; cellRange: CellRange }[];
}

function SelectorElement(props: SelectorElementProps) {
  const { data, events } = useContext(SheetContext);
  const render = useRender();

  useEffect(() => {
    const fn = () => render();
    events.on(EventTypes.Scroll, fn);

    return () => {
      events.off(EventTypes.Scroll, fn);
    };
  }, [events, render]);

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
    el = (
      <div className={styles.selectorArea} style={style}>
        <div className={styles.selectorCorner}/>
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

export default function Selector(props: SelectorProps) {
  const render = useState(0)[1];
  const { events, data } = useContext(SheetContext);

  const { visible, range } = data.selector;

  useEffect(() => {
    let count = 1;
    const selecting = () => {
      render(count++);
    };
    events.on(EventTypes.CellSelecting, selecting);

    return () => {
      events.off(EventTypes.CellSelecting, selecting);
    };
  }, [events, render]);

  return (
    <div className={styles.selectors}>
      <SelectorElement visible={visible} type="selector" cellRange={range}/>
      {props.selectors?.map((item) =>
        <SelectorElement key={item.key} visible={false} type={item.type} cellRange={item.cellRange}/>)
      }
    </div>
  );
}
