import 'antd/dist/antd.less'
import { Buffer } from 'buffer'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initBuerli } from './initBuerli'
import Global from './styles/Global'
;(window as any).Buffer = Buffer

initBuerli()

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <>
    <Global />
    <App />
  </>,
)
