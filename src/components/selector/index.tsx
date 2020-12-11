import { h } from 'preact';
import styles from './index.scss';
import { ElementOffsetSize } from '../index';

interface SelectorElementProps {
  visible: boolean;
  offset?: ElementOffsetSize;
  areaOffset?: ElementOffsetSize;
}

function SelectorElement(props: SelectorElementProps) {
  return (
    <div className={styles.selector}>
      <div className={styles.selectorArea}>
        <div className={styles.selectorCorner}/>
      </div>
      <div className={styles.selectorClipboard}/>
      <div className={styles.selectorAutofill}/>
    </div>
  );
}

export default function Selector() {
  return (
    <div className={styles.selectors}>
      <SelectorElement visible={false}/>
      {/*<SelectorElement visible={false}/>*/}
      {/*<SelectorElement visible={false}/>*/}
      {/*<SelectorElement visible={false}/>*/}
    </div>
  );
}
