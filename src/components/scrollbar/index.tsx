import { h, Component, createRef } from 'preact';
import styles from './index.scss';
import clsx from 'clsx';

interface ScrollbarProps {
  direction: 'vertical' | 'horizontal';
  onScroll?: (isVertical: boolean, scroll: number, event: UIEvent) => void;
}

interface ScrollbarState extends ScrollbarProps {
  visible: boolean;
  distance: number;
  contentDistance: number;
}

export default class Scrollbar extends Component<ScrollbarProps, ScrollbarState>{
  isVertical: boolean;
  scrollHandler = (e: UIEvent) => {
    e.stopPropagation();
    const { scrollTop, scrollLeft } = e.target as HTMLElement;
    if (this.state.onScroll) {
      this.state.onScroll(this.isVertical, this.isVertical ? scrollTop : scrollLeft, e);
    }
  }
  mousemoveHandler = (e: MouseEvent) => e.stopPropagation()
  scrollEl = createRef<HTMLDivElement>()

  constructor(props: ScrollbarProps) {
    super();
    this.state = { ...props, distance: 0, contentDistance: 0, visible: false };
    this.isVertical = props.direction === 'vertical';
  }

  move(x: number, y: number) {
    this.scrollEl.current?.scroll(x, y);
  }

  set(distance: number, contentDistance: number) {
    const d = distance - 1;
    if (contentDistance > d) {
      this.setState({ distance: d - 15, contentDistance, visible: true });
    } else {
      this.setState({ visible: false });
    }
  }

  render() {
    return (
      <div
        ref={this.scrollEl}
        className={clsx(styles.scrollbar, this.isVertical ? styles.vertical : styles.horizontal)}
        style={{
          display: this.state.visible ? 'block' : 'none',
          [this.isVertical ? 'width' : 'height']: `${this.state.distance}px`
        }}
        onMouseMove={this.mousemoveHandler}
        onScroll={this.scrollHandler}
      >
        <div style={{ [this.isVertical ? 'height' : 'width']: `${this.state.contentDistance}px` }}/>
      </div>
    );
  }
}
