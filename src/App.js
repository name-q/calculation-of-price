import './App.css';
import { IRouter } from './irouter'

import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

function App() {
  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column'}}>
      <ConfigProvider locale={zhCN}>
        <IRouter />
      </ConfigProvider>
    </div>
  );
}

export default App;
