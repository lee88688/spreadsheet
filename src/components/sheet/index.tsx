import { h, Component }  from 'preact';
import styles from './index.scss';

export default class Sheet extends Component<any, any>{
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={styles.sheet}>
        <canvas/>
      </div>
    );
  }
}
