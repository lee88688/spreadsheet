import habitat from 'preact-habitat';
import { h, Component } from 'preact';
import styles from './index.scss';
import BottomBar from './components/bottomBar';
import Sheet from './components/sheet';

class SpreadSheet extends Component<any, any>{
  constructor(props: any) {
    super(props);
    console.log(styles);
  }

  render() {
    return (
      <div className="spreadsheet" onContextMenu={e => e.preventDefault()}>
        <Sheet />
        <BottomBar/>
      </div>
    );
  }
}

const _habitat = habitat(SpreadSheet);

_habitat.render({
  selector: '[data-widget-host="habitat"]',
  clean: true
});

// new SpreadSheet('[data-widget-host="habitat"]');
