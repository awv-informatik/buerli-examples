import styled from 'styled-components'

export const CanvasContainer = styled.div`
  overflow: hidden;
  display: grid;
  > * {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    align-self: center;
    justify-self: center;
    overflow: hidden;
  }
`
