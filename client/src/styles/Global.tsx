import * as styled from 'styled-components'

const Global = styled.createGlobalStyle`
  * {
    box-sizing: border-box;
    outline: none;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
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
  }

  body {
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    font-family: 'Segoe UI', Tahoma, Verdana, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: rgb(107, 113, 119);

    background: hsla(186, 33%, 94%, 1);
    background: linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%);
    background: -moz-linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%);
    background: -webkit-linear-gradient(
      90deg,
      hsla(186, 33%, 94%, 1) 0%,
      hsla(216, 41%, 79%, 1) 100%
    );
    filter: progid: DXImageTransform.Microsoft.gradient( startColorstr="#EBF4F5", endColorstr="#B5C6E0", GradientType=1 );
  }

  .features {
    * {
      color: inherit !important;
    }
  }

  .active {
    color: dodgerblue !important;
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
