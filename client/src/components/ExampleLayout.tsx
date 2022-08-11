import React from 'react'
import styled from 'styled-components'

const classes: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three' }

export const ExampleLayout: React.FC = ({ children }) => {
  const count = React.useMemo(() => {
    const filtered: any[] = []
    React.Children.forEach(children, c => {
      if (c) filtered.push(c)
    })
    return filtered.length
  }, [children])
  const cls = React.useMemo(() => classes[count], [count])
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
    grid-template-columns: minmax(190px, min-content) 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
  }
  &.three {
    display: grid;
    height: 100%;
    width: 100%;
    grid-template-columns: minmax(300px, min-content) 1fr min-content;
    grid-template-rows: 1fr;
  }
`
