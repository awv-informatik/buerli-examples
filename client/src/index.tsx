import 'antd/dist/antd.less'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Global from './shared/styles/Global'

ReactDOM.render(
  <>
    <Global />
    <App />
  </>,
  document.getElementById('root'),
)
