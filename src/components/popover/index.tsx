import clsx from 'clsx';
import { h, ComponentChildren, ComponentChild } from 'preact';
import { useRef, useEffect, useLayoutEffect } from 'preact/compat';
import { JSX } from 'preact/jsx-runtime';
import { createPopper, Instance, Placement } from '@popperjs/core';
import styles from './index.scss';

interface PopoverProps extends JSX.DOMAttributes<EventTarget> {
  visible: boolean;
  placement?: Placement;
  className?: string;
  contentClassName?: string;
  children: ComponentChildren;
  content: ComponentChild;
  offset?: number[];
}

export default function Popover(props: PopoverProps) {
  const {
    visible = false,
    placement = 'bottom',
    className,
    contentClassName,
    children,
    content,
    offset,
    ...otherProps
  } = props;

  const popoverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popoverInstance = useRef<Instance>(null);

  useLayoutEffect(() => {
    console.log(popoverRef.current?.clientWidth);
    popoverInstance.current = createPopper(
      popoverRef.current,
      contentRef.current,
      {
        placement,
        modifiers: [
          { name: 'offset', options: { offset } },
          { name: 'flip', enabled: true }
        ]
      }
    );

    return () => {
      // console.log('destroy')
      popoverInstance.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      popoverInstance.current?.update();
      contentRef.current?.setAttribute('data-show', '');
    } else {
      contentRef.current?.removeAttribute('data-show');
    }
  }, [visible]);

  return (
    <div ref={popoverRef} className={clsx(styles.popover, className)} {...otherProps}>
      {children}
      <div ref={contentRef} className={clsx(styles.content, contentClassName)}>{content}</div>
    </div>
  );
}
