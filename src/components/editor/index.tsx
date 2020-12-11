import { h } from 'preact';
import {} from 'preact/hooks';
import styles from './index.scss';

interface EditorProps {
  visible: boolean;
  rowHeight?: number;
  tableOffset?: number;
  offset?: number;
}

export default function Editor(props: EditorProps) {
  return (
    <div className={styles.editor} style={{ display: props.visible ? 'block' : 'none' }}>
      <div className={styles.editorArea}>
        <textarea/>
        <div className={styles.textLine}/>
        <div className={styles.suggest}/>
      </div>
    </div>
  );
}
