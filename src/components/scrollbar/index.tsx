import { h } from 'preact';
import { useCallback, useRef, useImperativeHandle } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import styles from './index.scss';
import clsx from 'clsx';

interface ScrollbarProps {
  direction: 'vertical' | 'horizontal';
  onScroll?: (isVertical: boolean, scroll: number, event: UIEvent) => void;
  distance: number;
  contentDistance: number;
}

const mousemoveHandler = (e: MouseEvent) => e.stopPropagation();

const Scrollbar = forwardRef(function Scrollbar(props: ScrollbarProps, ref) {
  const isVertical = props.direction === 'vertical';

  const scrollEl = useRef<HTMLDivElement>();
  const scrollHandler = useCallback((e: UIEvent) => {
    e.stopPropagation();
    const { scrollTop, scrollLeft } = e.target as HTMLElement;
    if (props.onScroll) {
      props.onScroll(isVertical, isVertical ? scrollTop : scrollLeft, e);
    }
  }, [props.onScroll]);

  useImperativeHandle(ref, () => ({
    move(x: number, y: number) {
      scrollEl.current?.scroll(x, y);
    }
  }), [scrollEl]);

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
