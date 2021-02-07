import { Spin as SpinImpl } from 'antd'
import React from 'react'
import styled from 'styled-components'

export const Spin: React.FC = () => {
  return (
    <Container>
      <SpinImpl size="large" />
      <Loading>Loading...</Loading>
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  justify-items: center;
  z-index: 1000;
  .ant-spin-dot-item {
    background-color: black;
  }
`

const Loading = styled.span`
  padding-left: 8px;
  color: black;
  opacity: 0.8;
  z-index: 1000;
`
