import { solid } from '@buerli.io/headless'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
import React, { useEffect, useRef } from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import Controls from './Controls'

const examples = [
  { label: 'smiley', value: 'smiley', create: require('./models/smiley').default },
  { label: 'atonium', value: 'atonium', create: require('./models/atomium').default },
  { label: 'felge', value: 'felge', create: require('./models/felge').default },
  { label: 'fish', value: 'fish', create: require('./models/fish').default },
  { label: 'hackathon', value: 'hackathon', create: require('./models/hackathon').default },
  { label: 'heart', value: 'heart', create: require('./models/heart').default },
  { label: 'lego', value: 'lego', create: require('./models/lego').default },
  { label: 'machine-part', value: 'machine-part', create: require('./models/machine-part').default },
  { label: 'polyline-extrusion', value: 'polyline-extrusion', create: require('./models/polyline-extrusion').default },
  { label: 'polyline-revolve', value: 'polyline-revolve', create: require('./models/polyline-revolve').default },
  { label: 'rounded-rect', value: 'rounded-rect', create: require('./models/rounded-rect').default },
  { label: 'samples', value: 'samples', create: require('./models/samples').default },
  { label: 'spline-shape', value: 'spline-shape', create: require('./models/spline-shape').default },
  { label: 'testfile', value: 'testfile', create: require('./models/testfile').default },
  { label: 'whiffleball', value: 'whiffleball', create: require('./models/whiffleball').default },
]

const Part: React.FC<{ active: string }> = props => {
  const scene = useRef<THREE.Scene>()
  const example = React.useMemo(() => examples.find(e => e.value === props.active), [props.active])

  useEffect(() => {
    document.title = 'Solid API'
  }, [])

  useEffect(() => {
    const sceneObj = scene.current
    const cad = new solid(CCSERVERURL)
    cad.init(async api => {
      const items = await example.create(api)
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
  }, [example])

  return <scene ref={scene} />
}

export const SolidApiApp: React.FC<{}> = () => {
  const [active, setActive] = React.useState<string>(examples[0].value)
  const onChange = React.useCallback((ev: RadioChangeEvent) => setActive(ev.target.value), [setActive])
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <br />
      <div style={{ width: '100%', height: '5%' }}>
        <Radio.Group options={examples} onChange={onChange} value={active} optionType="button" buttonStyle="solid" />
      </div>
      <div style={{ width: '100%', height: '80%' }}>
        <Canvas camera={{ position: [30, 15, 20], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 0, 0]} intensity={0.1} />
          <pointLight position={[0, 20, 0]} intensity={0.5} />
          <pointLight position={[0, 0, 20]} intensity={0.9} />

          <group scale={[0.1, 0.1, 0.1]}>
            <Part active={active} />
          </group>
          <Controls />
          <axesHelper visible={true} />
        </Canvas>
      </div>
    </div>
  )
}

export default SolidApiApp
