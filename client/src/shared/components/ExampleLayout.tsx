import React from 'react'
import styled from 'styled-components'

export const ExampleLayout: React.FC = ({ children }) => {
  const classes: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' }
  const count = React.useMemo(() => {
    const filtered: any[] = []
    React.Children.forEach(children, c => {
      if (c) filtered.push(c)
    })
    return filtered.length
  }, [children])
  const cls = React.useMemo(() => classes[count], [count, classes])
  return <InnerLayout className={cls}>{children}</InnerLayout>
}

const InnerLayout = styled.div`
  display: grid;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.2);
  border-radius: 4px;

  /* column-gap: 40px; */
  > div {
    padding: 10px;
    margin-right: 8px;
    margin-bottom: 2px;
    align-self: stretch;
    justify-self: stretch;
    overflow: auto;
  }
  &.one {
    display: grid;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
  &.two {
    display: grid;
    height: 100%;
    width: 100%;
    grid-template-columns: max-content 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
  }
  &.three {
    display: grid;
    height: 100%;
    width: 100%;
    grid-template-columns: max-content 1fr 0.5fr;
    grid-template-rows: 1fr;
  }
  &.four {
    display: grid;
    height: 100%;
    width: 100%;
    grid-template-columns: max-content 1fr 0.5fr;
    grid-template-rows: 1fr 1fr;

    > :nth-child(1) {
      grid-row: 1 / 3;
      grid-column: 1 / 2;
    }

    > :nth-child(2) {
      grid-row: 1 / 3;
      grid-column: 2 / 3;
    }

    > :nth-child(3) {
      grid-row: 1 / 2;
      grid-column: 3 / 4;
    }

    > :nth-child(4) {
      grid-row: 2 / 3;
      grid-column: 3 / 4;
    }
  }
`
