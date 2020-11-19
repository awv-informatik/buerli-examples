import * as styled from 'styled-components'

const Global = styled.createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #e6e6fa;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    overflow: hidden;
  }

  #root {
    overflow: auto;
    font-family: segoe ui, arial, sans-serif;
  }

  body {
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    color: black;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-button {
    height: 0px;
    width: 0px;
    background-color: rgba(0, 0, 0, 0.3);
  }

  ::-webkit-scrollbar-corner {
    background-color: rgba(0, 0, 0, 0.3);
  }

  body {
    scrollbar-face-color: rgba(0, 0, 0, 0.3);
  }
`

export { Global }
export default Global
