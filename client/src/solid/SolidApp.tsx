import { solid } from '@buerli.io/headless'
import CodeMirror from '@uiw/react-codemirror'
import 'codemirror/keymap/sublime'
import 'codemirror/theme/material.css'
import 'codemirror/theme/monokai.css'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import { CanvasContainer, CanvasContent, ExampleLayout, Options, Spin } from '../shared/components'
import { load } from './models'

type ExamplesType = ReturnType<typeof load>

export const SolidApp: React.FC<{}> = () => {
  const examples = React.useMemo(() => load(), [])
  const options = React.useMemo(() => examples.map(e => e.file), [examples])
  const [active, setActive] = React.useState<string>(examples[0].file)
  const example = React.useMemo(() => examples.find(e => e.file === active), [active, examples])
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    document.title = 'Solid'
  }, [])

  return (
    <ExampleLayout>
      <Options values={options} onChange={v => setActive(v)} active={active} />
      <CanvasContainer>
        <Canvas>
          <Part active={active} examples={examples} onState={state => setLoading(state === 'loading')} />
        </Canvas>
        {loading && <Spin />}
      </CanvasContainer>
      <div>
        <CodeMirror
          value={example.text}
          options={{
            folding: true,
            readOnly: true,
            theme: 'material',
            keyMap: 'sublime',
            mode: 'ts',
          }}
        />
      </div>
    </ExampleLayout>
  )
}

export default SolidApp

const Part: React.FC<{
  active: string
  examples: ExamplesType
  onState?: (state: 'loading' | 'done') => void
}> = props => {
  const example = React.useMemo(() => props.examples.find(e => e.file === props.active), [props.active])
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])

  React.useEffect(() => {
    setMeshes([])
    props.onState && props.onState('loading')
    const cad = new solid(CCSERVERURL)
    cad.init(async api => {
      const items = await example.create(api)
      props.onState && props.onState('done')
      setMeshes(items)
    })

    return () => cad.destroy()
  }, [example])

  return (
    <CanvasContent>
      {meshes.map(m => (
        <mesh key={m.uuid} {...m} />
      ))}
    </CanvasContent>
  )
}
