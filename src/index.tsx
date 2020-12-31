import habitat from 'preact-habitat';
import { h, Component, createRef } from 'preact';
import styles from './index.scss';
import BottomBar from './components/bottomBar';
import Sheet from './components/sheet';
import './icons/icons.font.js';

class SpreadSheet extends Component<any, any>{
  plugins: any[]
  sheetRef = createRef<Sheet>()

  constructor(props: any) {
    super(props);
    console.log(styles);
    this.plugins = props.plugins;
  }

  render() {
    return (
      <div className="spreadsheet" onContextMenu={e => e.preventDefault()}>
        <Sheet ref={this.sheetRef} />
        <BottomBar/>
      </div>
    );
  }
}

const _habitat = habitat(SpreadSheet);

_habitat.render({
  selector: '[data-widget-host="habitat"]',
  clean: true,
  defaultProps: {
    plugins: []
  }
});

// new SpreadSheet('[data-widget-host="habitat"]');
