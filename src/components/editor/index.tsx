import { h } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import styles from './index.scss';
import { SheetContext } from '../sheet';
import { EditorVisibleEventParams, EventTypes } from '../index';

interface EditorProps {
  visible: boolean;
}

export default function Editor(props: EditorProps) {
  const [editorParams, setEditorParams] = useState<EditorVisibleEventParams>({ visible: false });
  const { events, data } = useContext(SheetContext);
  const textarea = useRef<HTMLTextAreaElement>();

  useEffect(() => {
    const editorFn = (params: EditorVisibleEventParams) => {
      setEditorParams(params);
    };
    events.on(EventTypes.EditorVisible, editorFn);

    return () => {
      events.off(EventTypes.EditorVisible, editorFn);
    };
  }, [data, events]);

  useEffect(() => {
    const scrollFn = () => {
      if (!editorParams.visible) return;
      const rect = data.getSelectedRect();
      setEditorParams({ visible: true, rect });
    };
    events.on(EventTypes.Scroll, scrollFn);

    return () => {
      events.off(EventTypes.Scroll, scrollFn);
    };
  }, [data, editorParams.visible, events]);

  useEffect(() => {
    if (editorParams.visible) {
      textarea.current.focus();
    }
  }, [editorParams.visible]);

  const width = editorParams.rect ? editorParams.rect.width - 9 + 0.3 : 0;
  const height = editorParams.rect ? editorParams.rect.height - 3 + 0.3 : 0;

  return (
    <div className={styles.editor} style={{ display: editorParams.visible ? 'block' : 'none' }}>
      <div
        className={styles.editorArea}
        style={{
          left: `${editorParams.rect?.left ?? 0}px`,
          top: `${editorParams.rect?.top ?? 0}px`
        }}
      >
        <textarea
          ref={textarea}
          style={{
            width: `${width ?? 0}px`,
            height: `${height ?? 0}px`
          }}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
        />
        <div className={styles.textLine}/>
        <div className={styles.suggest}/>
      </div>
    </div>
  );
}
