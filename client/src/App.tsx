import 'antd/dist/antd.css'
import React from 'react'
import styled from 'styled-components'
import HistoryApp from './components/HistoryApp'
import { initBuerli } from './initBuerli'
import { Home } from './styles/Home'

initBuerli()

const options = [
  { label: 'History', value: 'history', comp: HistoryApp },
]

const apps = {
  [options[0].value]: options[0].comp,
}

/**
 * The application component.
 */
export const App: React.FC = () => {
  const [active, setActive] = React.useState<string>(options[0].value)
  const ActiveApp = React.useMemo(() => apps[active], [active])
  return (
    <Container>
      <Home>
        <div className="menu left" style={{ marginTop: '-0.8rem' }}>
          <h1>
            buerli.<span style={{ fontSize: '0.4em', verticalAlign: 'super', letterSpacing: 0 }}>BETA | EXAMPLES</span>
          </h1>
        </div>
        <Options className="menu middle">
          {options.map(o => (
            <a
              className={o.value === active ? 'active' : ''}
              key={o.label}
              href={'_blank'}
              onClick={e => {
                e.preventDefault()
                setActive(o.value)
              }}>
              {o.label}
            </a>
          ))}
        </Options>
      </Home>
      <Content>
        <ActiveApp />
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
