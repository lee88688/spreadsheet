import { h, Component } from 'preact';
import styles from './index.scss';
import Tooltip from '../tooltip';
import clsx from 'clsx';

export class Toolbar extends Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={styles.toolbar}>
        <div className={styles.toolbarButtons}>
          <Tooltip className={clsx(styles.toolbarButton, styles.disabled)} content="undo">
            <i className="ss-icon ss-icon-undo"/>
          </Tooltip>
        </div>
      </div>
    );
  }
}
