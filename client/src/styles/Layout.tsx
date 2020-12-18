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
  overflow: hidden;
`

export const CanvasCells = styled.div`
  position: relative;
  display: flex;
  grid-column: 1/-1;
  grid-row: 1/-1;
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
  overflow: auto;
  z-index: 1000;
  grid-column: 1/7;
  grid-row: 2;
  height: min-content;
  padding-left: 10px;
  padding-right: 10px;
`

export const ObjectPluginsCells = styled.div`
  z-index: 1000;
  height: auto;
  grid-column: 7/12;
  grid-row-start: 2;
  padding-right: 10px;
`
