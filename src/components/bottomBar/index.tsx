import { h, Component } from 'preact';
import styles from './index.scss';

export default class BottomBar extends Component<any, any>{
  constructor() {
    super();
  }

  render() {
    return (
      <div className={styles.bottomBar}>
        <ul className={styles.menu}>
          <li className={styles.icon}>34</li>
        </ul>
      </div>
    );
  }
}
