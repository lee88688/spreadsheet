import {ComponentChildren, h} from 'preact';
import { Placement } from '@popperjs/core';
import Popover from '../popover';
import styles from './index.scss';

interface DropdownProps {
  className?: string;
  placement?: Placement;
  children: ComponentChildren;
  content: ComponentChildren;
}

export function Dropdown(props: DropdownProps) {
  const {
    placement = 'bottom',
    className,
    children,
    content,
  } = props;

  return (
    <Popover visible={true} className={className} contentClassName={styles.dropdownContent} placement={placement} content={content}>
      {children}
    </Popover>
  );
}
