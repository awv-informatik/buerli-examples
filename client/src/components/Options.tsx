import React from 'react'
import styled from 'styled-components'
import { Example } from '../store'

export const Options: React.FC<{
  examples: Record<string, Example>
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, active, onChange }) => {
  return (
    <Container>
      {Object.keys(examples).map(
        key => (
          <div
            className={key === active ? 'active' : ''}
            key={key}
            onClick={e => {
              onChange && onChange(key)
            }}>
            {examples[key].label}
          </div>
        )
      )}
    </Container>
  )
}

const Container = styled.div`
  div {
    font-size: 15px;
    padding: 0 0 5px 0;
    :hover {
      opacity: 0.5;
      cursor: pointer;
    }
  }
  .active {
    color: dodgerblue !important;
  }
`
