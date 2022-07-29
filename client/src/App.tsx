import 'antd/dist/antd.css'
import React from 'react'
import styled from 'styled-components'
import Main from './components/Main'
import { initBuerli } from './initBuerli'
import { Home } from './styles/Home'

initBuerli()

/**
 * The application component.
 */
export const App: React.FC = () => {
  return (
    <Container>
      <Home>
        <div className="menu left" style={{ marginTop: '-0.8rem' }}>
          <h1>
            buerli.<span style={{ fontSize: '0.4em', verticalAlign: 'super', letterSpacing: 0 }}>BETA | EXAMPLES</span>
          </h1>
        </div>
      </Home>
      <Content>
        <Main />
      </Content>
    </Container>
  )
}

export default App

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: grid;
  grid-template-rows: 120px 1fr;
`

const Content = styled.div`
  margin: 0 auto;
  width: 100%;
  height: 100%;
  padding-left: 4rem;
  padding-right: 4rem;
  padding-bottom: 3rem;
  overflow: hidden;
`

const Options = styled.div`
  a.active {
    color: dodgerblue;
  }
  a:hover {
    opacity: 0.5;
    cursor: pointer;
  }
`
