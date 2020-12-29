import { h } from 'preact';
import { useCallback, useRef, useImperativeHandle, useContext, useEffect, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import styles from './index.scss';
import clsx from 'clsx';
import { SheetContext } from '../sheet';
import { EventTypes, ScrollEventParams, ScrollSheetEventParams } from '../index';

export enum ScrollbarDirectionType {
  vertical = 'vertical', // col scrollbar
  horizontal = 'horizontal' // row scrollbar
}

interface ScrollbarProps {
  direction: ScrollbarDirectionType;
}

const mousemoveHandler = (e: MouseEvent) => e.stopPropagation();

const Scrollbar = forwardRef(function Scrollbar(props: ScrollbarProps, ref) {
  const isVertical = props.direction === 'vertical';

  const [distanceState, setDistanceState] = useState({ distance: 0, contentDistance: 0 });
  const { events, data } = useContext(SheetContext);
  const scrollEl = useRef<HTMLDivElement>();
  const scrollHandler = useCallback((e: UIEvent) => {
    e.stopPropagation();
    const { scrollTop, scrollLeft } = e.target as HTMLElement;
    const params: ScrollEventParams = {
      direction: isVertical ? ScrollbarDirectionType.vertical : ScrollbarDirectionType.horizontal,
      scrollLeft: isVertical ? 0 : scrollLeft,
      scrollTop: isVertical ? scrollTop : 0
    };
    // update DataProxy scroll
    const x = isVertical ? data.scroll.x : scrollLeft;
    const y = isVertical ? scrollTop : data.scroll.y;
    data.scroll.x = x;
    data.scroll.y = y;
    if (isVertical) {
      data.scrolly(y);
    } else {
      data.scrollx(x);
    }

    // emit event at last
    events.emit(EventTypes.Scroll, params);
  }, [data, events, isVertical]);

  useEffect(() => {
    const fn = (params: ScrollSheetEventParams) => {
      const { horizontalDelta, verticalDelta, direction } = params;
      if (direction !== props.direction) return;
      const { scrollLeft, scrollTop } = scrollEl.current;
      const left = isVertical ? scrollLeft : scrollLeft + horizontalDelta;
      const top = isVertical ? scrollTop + verticalDelta : scrollTop;
      scrollEl.current.scroll(left, top); // calling scroll function will get a scroll event
    };
    events.on(EventTypes.ScrollSheet, fn);
    return () => {
      events.off(EventTypes.ScrollSheet, fn);
    };
  }, [events, isVertical, props.direction]);

  useEffect(() => {
    const distanceChangeFn = () => {
      // const { width, height } = data.getRect();
      if (isVertical) {
        const height = data.viewHeight();
        const colResizerHeight = data.exceptRowTotalHeight(0, -1);
        const totalHeight = data.rows.totalHeight();
        setDistanceState({ distance: height, contentDistance: totalHeight - colResizerHeight });
      } else {
        const width = data.viewWidth();
        const totalWidth = data.cols.totalWidth();
        setDistanceState({ distance: width, contentDistance: totalWidth });
      }
    };
    events.on(EventTypes.ScrollDistanceChange, distanceChangeFn);

    return () => {
      events.off(EventTypes.ScrollDistanceChange, distanceChangeFn);
    };
  }, [data, events, isVertical]);

  const d = distanceState.distance - 1;
  let visible = false;
  let distance = 0;
  let contentDistance = 0;
  if (distanceState.contentDistance > d) {
    distance = d - 15;
    contentDistance = distanceState.contentDistance;
    visible = true;
  }

  return (
    <div
      ref={scrollEl}
      className={clsx(styles.scrollbar, isVertical ? styles.vertical : styles.horizontal)}
      style={{
        display: visible ? 'block' : 'none',
        [isVertical ? 'height' : 'width']: `${distance}px`
      }}
      onMouseMove={mousemoveHandler}
      onScroll={scrollHandler}
    >
      <div
        style={{
          [isVertical ? 'height' : 'width']: `${contentDistance}px`,
          [isVertical ? 'width' : 'height']: '1px'
        }}
      />
    </div>
  );
});

export default Scrollbar;
