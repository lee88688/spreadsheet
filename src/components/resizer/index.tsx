import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import styles from './index.scss';
import clsx from 'clsx';

interface ResizerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ResizerProps {
  visible: boolean;
  direction: 'vertical' | 'horizontal';
  minDistance: number;
  rect: ResizerRect;
  line: { width: number; height: number };
  onResizeEnd: Function;
}

export default function Resizer(props: ResizerProps) {
  const [rect, setRect] = useState<ResizerRect>({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (props.visible) {
      setRect(props.rect);
    }
  }, [props.visible]);

  const isVertical = props.direction === 'vertical';

  const mousedownHandler = (e: MouseEvent) => {
    const startEvent = e;
    const distance = isVertical ? rect.width : rect.height;
  };

  return (
    <div
      className={clsx(styles.resizer, props.direction === 'vertical' ? styles.vertical : styles.horizontal)}
      style={{
        left: `${isVertical ? rect.left + rect.width - 5 : rect.left}px`,
        top: `${isVertical ? rect.top : rect.top + rect.height - 5}px`
      }}
    >
      {/* unhideHoverEl */}
      <div
        className={styles.resizerHover}
        style={{
          left: `${isVertical ? 5 - rect.width : rect.left}px`,
          top: `${isVertical ? rect.top : 5 - rect.height}px`,
          width: `${isVertical ? 5 : rect.width}px`,
          height: `${isVertical ? rect.height : 5}px`
        }}
      />
      {/* hoverEl */}
      <div
        className={styles.resizerHover}
        style={{
          width: `${isVertical ? 0 : rect.width}px`,
          height: `${isVertical ? rect.height : 5}px`
        }}
      />
      {/* lineEl */}
      <div
        className={styles.resizerLine}
        style={{
          width: `${isVertical ? 0 : props.line.width}px`,
          height: `${isVertical ? props.line.height : 0}px`
        }}
      />
    </div>
  );
}
