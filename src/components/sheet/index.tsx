import { h, Component, createRef }  from 'preact';
import Resizer from '../resizer';
import Scrollbar from '../scrollbar';
import styles from './index.scss';

export default class Sheet extends Component<any, any>{
  eventMap = new Map()

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={styles.sheet}>
        <canvas className={styles.table}/>
        <div class={styles.overlay}>
          <div className={styles.overlayContent}/>
        </div>
        <Resizer visible={false} direction="horizontal" minDistance={0}/>
        <Resizer visible={false} direction="vertical" minDistance={0}/>
        <Scrollbar direction="vertical"/>
        <Scrollbar direction="horizontal"/>
      </div>
    );
  }
}
