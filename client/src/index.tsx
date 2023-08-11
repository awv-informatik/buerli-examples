import { Buffer } from 'buffer'
import 'antd/dist/antd.less'
import { createRoot } from 'react-dom/client'
import App from './App'
import Global from './styles/Global'
;(window as any).Buffer = Buffer

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <>
    <Global />
    <App />
  </>,
)
