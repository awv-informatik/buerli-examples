import styled from 'styled-components'

export const MainGrid = styled.main`
  display: grid;
  height: 100%;
  overflow: hidden;
`

export const AppGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(52px, 1fr));
  max-height: 100%;
  height: 100%;
  overflow: hidden;
`

export const CanvasCells = styled.div`
  position: relative;
  display: flex;
  grid-column: 1/-1;
  grid-row: 1/-2;
  overflow: hidden;
`

export const CanvasContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  overflow: hidden;
  & canvas {
    overflow: hidden;
  }
`

export const MenuCells = styled.div`
  z-index: 1000;
  display: grid;
  grid-column: 1/-1;
  grid-row: 1/2;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-items: center;
`

export const GlobalPluginsCells = styled.div`
  position: relative;
  grid-column: 1/7;
  grid-row: 2/-2;
  & div {
    z-index: 100;
    overflow: auto;
    overflow-x: hidden;
    max-height: 100%;
    padding-right: 2px;
  }
`

export const ObjectPluginsCells = styled.div`
  z-index: 1000;
  height: auto;
  grid-column: 7/12;
  grid-row-start: 2;
  padding-right: 10px;
`

export const ExampleWrapper = styled.div`
  display: grid;
  overflow: hidden;
  height: 100%;
  width: 100%;
  grid-template-columns: auto 1fr 1fr;
  grid-template-rows: 1fr 1fr;
`

export const ExampleOptions = styled.div`
  grid-row: 1 / 3;
  grid-column: 1 / 2;
  overflow: hidden;
  div {
    font-size: 15px;
    padding: 0 0 5px 0;
    :hover {
      opacity: 0.5;
      cursor: pointer;
    }
  }
  .active {
    color: dodgerblue;
  }
`

export const ExampleCanvas3D = styled.div`
  grid-row: 1 / 3;
  grid-column: 2 / 3;
  overflow: hidden;
`

export const ExampleCode = styled.div`
  grid-row: 1 / 2;
  grid-column: 3 / 4;
  overflow: hidden;
`

export const ExampleDescription = styled.div`
  grid-row: 2 / 3;
  grid-column: 3 / 4;
  overflow: hidden;
`
