import { history } from '@buerli.io/headless'
import CodeMirror from '@uiw/react-codemirror'
import 'codemirror/keymap/sublime'
import 'codemirror/theme/material.css'
import 'codemirror/theme/monokai.css'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import { CanvasContent } from '../shared/components/CanvasContent'
import {
  ExampleCanvas3D,
  ExampleCode,
  ExampleDescription,
  ExampleOptions,
  ExampleWrapper,
} from '../shared/styles/Layout'
import { load } from './models'

type ExamplesType = ReturnType<typeof load>

export const HistoryApiApp: React.FC<{}> = () => {
  const examples = React.useMemo(() => load(), [])
  const options = React.useMemo(() => examples.map(e => e.file), [examples])
  const [testParam, setTestParam] = React.useState(10)
  const [active, setActive] = React.useState<string>(examples[0].file)
  const example = React.useMemo(() => examples.find(e => e.file === active), [active, examples])

  React.useEffect(() => {
    document.title = 'History API'
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
        <Canvas>
          <Part active={active} examples={examples} testParam={testParam} />
        </Canvas>
      </ExampleCanvas3D>
      <ExampleCode>
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
      </ExampleCode>
      <ExampleDescription></ExampleDescription>
    </ExampleWrapper>
  )
}

export default HistoryApiApp

const Part: React.FC<{
  testParam: number
  active: string
  examples: ExamplesType
  onState?: (state: 'loading' | 'done') => void
}> = ({ testParam, active, examples, onState }) => {
  const example = React.useMemo(() => examples.find(e => e.file === active), [active])
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])

  React.useEffect(() => {
    document.title = 'Solid API'
  }, [])

  React.useEffect(() => {
    setMeshes([])
    onState && onState('loading')
    const cad = new history(CCSERVERURL)
    cad.init(async api => {
      const items = await example.create(api, testParam)
      onState && onState('done')
      setMeshes(items)
    })

    return () => cad.destroy()
  }, [example])

  return (
    <>
      <CanvasContent>
        {meshes.map(m => (
          <mesh key={m.uuid} {...m} />
        ))}
      </CanvasContent>
    </>
  )
}
