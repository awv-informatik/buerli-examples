import { history } from '@buerli.io/headless'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import Controls from '../solid-api/Controls'

const examples = [
  { label: 'Cube_Part', value: 'Cube_Part', create: require('./models/Cube_Part').default },
  { label: 'As1_Assembly', value: 'As1_Assembly', create: require('./models/As1_Assembly').default },
  {
    label: 'ConstraintProblem_Example',
    value: 'ConstraintProblem_Example',
    create: require('./models/ConstraintProblem_Example').default,
  },
  { label: 'CreateAsm_Example', value: 'CreateAsm_Example', create: require('./models/CreateAsm_Example').default },
  { label: 'Cylinder_Part', value: 'Cylinder_Part', create: require('./models/Cylinder_Part').default },
  { label: 'Flange_Part', value: 'Flange_Part', create: require('./models/Flange_Part').default },
  { label: 'LBracket_Assembly', value: 'LBracket_Assembly', create: require('./models/LBracket_Assembly').default },
  { label: 'Nut-Bolt_Assembly', value: 'Nut-Bolt_Assembly', create: require('./models/Nut-Bolt_Assembly').default },
  { label: 'Shadowbox_Part', value: 'Shadowbox_Part', create: require('./models/Shadowbox_Part').default },
]

const Part: React.FC<{ testParam: number; active: string }> = props => {
  const scene = React.useRef<THREE.Scene>()
  const { testParam } = props
  const example = React.useMemo(() => examples.find(e => e.value === props.active), [props.active])

  React.useEffect(() => {
    document.title = 'History API'
  }, [])

  React.useEffect(() => {
    const sceneObj = scene.current
    const cad = new history(CCSERVERURL)
    cad.init(async api => {
      const items = await example.create(api, testParam)
      for (const item of items) {
        sceneObj.add(item)
      }
    })

    return () => {
      cad.destroy()
      if (sceneObj) {
        sceneObj.children = []
      }
    }
  }, [testParam, example])

  return <scene ref={scene} />
}

export const HistoryApiApp: React.FC<{}> = () => {
  const [testParam, setTestParam] = React.useState(10)
  const [active, setActive] = React.useState<string>(examples[0].value)
  const onChange = React.useCallback((ev: RadioChangeEvent) => setActive(ev.target.value), [setActive])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ width: '100%', height: '5%' }}>
        <Radio.Group options={examples} onChange={onChange} value={active} optionType="button" buttonStyle="solid" />
      </div>
      <div style={{ width: '100%', height: '95%' }}>
        <Canvas camera={{ position: [30, 15, 20], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 0, 0]} intensity={0.1} />
          <pointLight position={[0, 20, 0]} intensity={0.5} />
          <pointLight position={[0, 0, 20]} intensity={0.9} />

          <group scale={[0.1, 0.1, 0.1]}>
            <Part testParam={testParam} active={active} />
          </group>
          <Controls />
          <axesHelper visible={true} />
        </Canvas>
      </div>
    </div>
  )
}

export default HistoryApiApp
