import { h } from 'preact';
import { useCallback, useRef, useImperativeHandle, useContext, useEffect } from 'preact/hooks';
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
  onScroll?: (isVertical: boolean, scroll: number, event: UIEvent) => void;
  distance: number;
  contentDistance: number;
}

const mousemoveHandler = (e: MouseEvent) => e.stopPropagation();

const Scrollbar = forwardRef(function Scrollbar(props: ScrollbarProps, ref) {
  const isVertical = props.direction === 'vertical';

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
    events.emit(EventTypes.Scroll, params);
    // update DataProxy scroll
    data.scroll.x = scrollLeft;
    data.scroll.y = scrollTop;
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

  // useImperativeHandle(ref, () => ({
  //   move(x: number, y: number) {
  //     scrollEl.current?.scroll(x, y);
  //   }
  // }), [scrollEl]);

  const d = props.distance - 1;
  let visible = false;
  let distance = 0;
  let contentDistance = 0;
  if (props.contentDistance > d) {
    distance = d - 15;
    contentDistance = props.contentDistance;
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
