import { solid } from '@buerli.io/headless'
import CodeMirror from '@uiw/react-codemirror'
import 'codemirror/keymap/sublime'
import 'codemirror/theme/material.css'
import 'codemirror/theme/monokai.css'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import {
  ExampleCanvas3D,
  ExampleCode,
  ExampleDescription,
  ExampleOptions,
  ExampleWrapper,
} from '../shared/styles/Layout'
import Controls from './Controls'
import { load } from './models'

type ExamplesType = ReturnType<typeof load>

export const SolidApiApp: React.FC<{}> = () => {
  const examples = React.useMemo(() => load(), [])
  const options = React.useMemo(() => examples.map(e => e.file), [examples])
  const [active, setActive] = React.useState<string>(examples[0].file)
  const example = React.useMemo(() => examples.find(e => e.file === active), [active, examples])

  React.useEffect(() => {
    document.title = 'Solid API'
  }, [])

  return (
    <ExampleWrapper>
      <ExampleOptions>
        {options.map(o => (
          <div className={o === active ? 'active' : ''} key={o} onClick={e => setActive(o)}>
            {o}
          </div>
        ))}
      </ExampleOptions>
      <ExampleCanvas3D>
        <Canvas camera={{ position: [30, 15, 20], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 0, 0]} intensity={0.1} />
          <pointLight position={[0, 20, 0]} intensity={0.5} />
          <pointLight position={[0, 0, 20]} intensity={0.9} />

          <group scale={[0.1, 0.1, 0.1]}>
            <Part active={active} examples={examples} />
          </group>
          <Controls />
          <axesHelper visible={true} />
        </Canvas>
      </ExampleCanvas3D>
      <ExampleCode>
        <CodeMirror
          height="100%"
          width="100%"
          value={example.text}
          options={{
            folding: true,
            readOnly: true,
            theme: 'material',
            keyMap: 'sublime',
            mode: 'ts',
          }}
        />
      </ExampleCode>
      <ExampleDescription></ExampleDescription>
    </ExampleWrapper>
  )
}

export default SolidApiApp

const Part: React.FC<{ active: string; examples: ExamplesType }> = props => {
  const scene = React.useRef<THREE.Scene>()
  const example = React.useMemo(() => props.examples.find(e => e.file === props.active), [props.active, props.examples])

  React.useEffect(() => {
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
