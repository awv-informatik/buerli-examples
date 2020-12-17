import 'antd/dist/antd.css'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
import React from 'react'
import CustomizableCAD from './customizable-cad/CustomizableCAD'
import SolidApiApp from './solid-api/SolidApiApp'

const options = [
  { label: 'customizable-cad', value: 'customizable-cad' },
  { label: 'solid-api', value: 'solid-api' },
]

const apps = {
  [options[0].value]: CustomizableCAD,
  [options[1].value]: SolidApiApp,
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
