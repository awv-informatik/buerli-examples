import 'antd/dist/antd.css'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
import React from 'react'
import CustomizableCAD from './customizable-cad/CustomizableCAD'
import HistoryApiApp from './history-api/HistoryApiApp'
import SolidApiApp from './solid-api/SolidApiApp'

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
  const onChange = React.useCallback((active: RadioChangeEvent) => setActive(active.target.value), [setActive])
  const ActiveApp = React.useMemo(() => apps[active], [active])
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', width: '100%', height: '100%' }}>
      <Radio.Group options={options} onChange={onChange} value={active} optionType="button" buttonStyle="solid" />
      <ActiveApp />
    </div>
  )
}

export default App
