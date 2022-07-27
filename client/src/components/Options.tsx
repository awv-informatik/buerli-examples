import React from 'react'
import styled from 'styled-components'

export const Options: React.FC<{
  values: string[]
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ values, active, onChange }) => {
  return (
    <Container>
      {values.map(value => (
        <div
          className={value === active ? 'active' : ''}
          key={value}
          onClick={e => {
            onChange && onChange(value)
          }}>
          {value}
        </div>
      ))}
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
`
