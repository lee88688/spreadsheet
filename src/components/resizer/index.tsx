import { h } from 'preact';
import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import styles from './index.scss';
import clsx from 'clsx';
import { SheetContext } from '../sheet';
import { EditorVisibleEventParams, EventTypes, ResizerResizeEventParams, ResizerVisibleEventParams } from '../index';

export enum ResizerDirectionType {
  vertical = 'vertical', // col resizer
  horizontal = 'horizontal' // row resizer
}

interface ResizerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ResizerProps {
  direction: ResizerDirectionType;
  minDistance: number;
  rect?: ResizerRect;
  line?: { width: number; height: number };
  onResizeEnd?: Function;
}

export default function Resizer(props: ResizerProps) {
  const [params, setParams] = useState<ResizerVisibleEventParams>({
    direction: props.direction,
    visible: false
  });
  const [moving, setMoving] = useState(false);
  const [lineVisible, setLineVisible] = useState(false);
  // const [mouseEvent, setMouseEvent] = useState<MouseEvent | null>(null);
  const { events } = useContext(SheetContext);
  const {
    visible,
    unhideVisible = false,
    line = { width: 0, height: 0 },
    rect = { left: 0, top: 0, height: 0, width: 0 }
  } = params;

  const isVertical = props.direction === 'vertical';

  const mousedownHandler = (e: MouseEvent) => {
    e.stopPropagation();
    setLineVisible(true);
    setMoving(true);
    // setMouseEvent(e);
    let mouseEvent = e;
    let distance = isVertical ? rect.width : rect.height;

    const mouseMoveHandler = (e: MouseEvent) => {
      // if (!moving) return;
      if (mouseEvent !== null && e.buttons === 1) {
        if (isVertical) {
          distance += e.movementX;
          if (distance > props.minDistance) {
            rect.width = distance;
          }
        } else {
          distance += e.movementY;
          if (distance > props.minDistance) {
            rect.height = distance;
          }
        }
        setParams({ ...params, rect });
        // setMouseEvent(e);
        mouseEvent = e;
      }
    };

    const mouseUpHandler = (e: MouseEvent) => {
      setMoving(false);
      setLineVisible(false);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      events.emit(EventTypes.ResizerResize, {
        type: 'end',
        distance,
        direction: props.direction,
        ri: params.ri,
        ci: params.ci
      } as ResizerResizeEventParams);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    events.emit(EventTypes.ResizerResize, {
      type: 'start',
      distance,
      direction: props.direction,
      ri: params.ri,
      ci: params.ci
    } as ResizerResizeEventParams);
    // resize start will stop editing
    events.emit(EventTypes.EditorVisible, { visible: false } as EditorVisibleEventParams);
  };

  useEffect(() => {
    const fn = (param: ResizerVisibleEventParams) => {
      if (param.direction !== props.direction) return;
      setParams(param);
    };
    events.on(EventTypes.ResizerVisible, fn);
    return () => {
      events.off(EventTypes.ResizerVisible, fn);
    };
  }, [events, props.direction]);

  return (
    <div
      className={clsx(styles.resizer, isVertical ? styles.vertical : styles.horizontal)}
      style={{
        display: visible ? 'block' : 'none',
        left: `${isVertical ? rect.left + rect.width - 5 : rect.left}px`,
        top: `${isVertical ? rect.top : rect.top + rect.height - 5}px`
      }}
      onMouseDown={mousedownHandler}
    >
      {/* unhideHoverEl */}
      <div
        className={styles.resizerHover}
        style={{
          display: unhideVisible ? 'block' : 'none',
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
          width: `${isVertical ? 5 : rect.width}px`,
          height: `${isVertical ? rect.height : 5}px`
        }}
      />
      {/* lineEl */}
      <div
        className={styles.resizerLine}
        style={{
          display: lineVisible ? 'block' : 'none',
          width: `${isVertical ? 0 : line.width}px`,
          height: `${isVertical ? line.height : 0}px`
        }}
      />
    </div>
  );
}
