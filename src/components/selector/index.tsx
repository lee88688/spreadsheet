import { h } from 'preact';
import { useContext } from 'preact/hooks';
import styles from './index.scss';
import { ElementOffsetSize } from '../index';
import { CellRange } from '../../core/cellRange';
import { SheetContext } from '../sheet';

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
  main: { visible: boolean; type?: 'selector'; cellRange: CellRange };
  selectors?: { key: string; visible: boolean; type: SelectorType; cellRange: CellRange }[];
}

function SelectorElement(props: SelectorElementProps) {
  const { data } = useContext(SheetContext);
  let el = null;
  const rect = data.coordinate.cellRange2Rect(props.cellRange);
  // const ftwidth = data.freezeTotalWidth();
  // const ftheight = data.freezeTotalHeight();
  const style = {
    display: props.visible ? 'block' : 'none',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width ?? 0}px`,
    height: `${rect.height ?? 0}px`
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
  return (
    <div className={styles.selectors}>
      <SelectorElement visible={props.main.visible} type="selector" cellRange={props.main.cellRange}/>
      {props.selectors?.map((item) =>
        <SelectorElement key={item.key} visible={false} type={item.type} cellRange={item.cellRange}/>)
      }
    </div>
  );
}
