import 'antd/dist/antd.css'
import React from 'react'
import CustomizableCAD from './customizable-cad/CustomizableCAD'
import HistoryApiApp from './history-api/HistoryApiApp'
import SolidApiApp from './solid-api/SolidApiApp'
import { Container } from './styles/Container'
import { Content } from './styles/Content'
import { Home } from './styles/Home'

const options = [
  { label: 'Solid API', value: 'solid-api', comp: SolidApiApp },
  { label: 'History API', value: 'history-api', comp: HistoryApiApp },
  { label: 'Customizable CAD', value: 'customizable-cad', comp: CustomizableCAD },
]

const apps = {
  [options[0].value]: options[0].comp,
  [options[1].value]: options[1].comp,
  [options[2].value]: options[2].comp,
}

/**
 * The application component.
 */
export const App: React.FC<{}> = () => {
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
        <div className="menu middle">
          {options.map(o => (
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                setActive(o.value)
              }}>
              {o.label}
            </a>
          ))}
        </div>
      </Home>
      <Content>
        <ActiveApp />
      </Content>
    </Container>
  )
}

export default App
