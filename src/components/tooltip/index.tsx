import { h, ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import styles from './index.scss';
import Popover from '../popover';
import clsx from 'clsx';

interface TooltipProps {
  placement?: 'top' | 'bottom';
  visible?: boolean;
  className?: string;
  content?: string;
  children: ComponentChildren;
}

export default function Tooltip(props: TooltipProps) {
  const [visible, setVisible] = useState<boolean>(props.visible || false);

  return (
    <Popover
      visible={visible}
      className={clsx(props.className, styles.tooltipWrap)}
      contentClassName={styles.tooltip}
      content={props.content}
      offset={[0, 5]}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {props.children}
    </Popover>
  );
}
