import { history } from '@buerli.io/headless'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import { CanvasContainer, CanvasContent, ExampleLayout, Options, Spin } from '../shared/components'
import { Code } from '../shared/components/Code'
import { useStore } from './store'

export const HistoryApp: React.FC<{}> = () => {
  const set = useStore(s => s.set)
  const exampleIds = useStore(s => s.examples.ids)
  const activeExample = useStore(s => s.activeExample)
  const loading = useStore(s => s.loading)

  React.useEffect(() => {
    document.title = 'History'
  }, [])

  return (
    <ExampleLayout>
      <Options values={exampleIds} onChange={v => set({ activeExample: v })} active={activeExample} />
      <CanvasContainer>
        <Canvas>
          <Part />
        </Canvas>
        {loading && <Spin />}
      </CanvasContainer>
      <div>
        <CodeWrapper />
      </div>
    </ExampleLayout>
  )
}

export default HistoryApp

const Part: React.FC = () => {
  const [testParam] = React.useState(10)
  const set = useStore(s => s.set)
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])

  React.useEffect(() => {
    setMeshes([])
    set({ loading: true })
    const cad = new history(CCSERVERURL)
    cad.init(async api => {
      const items = await example.create(api, testParam)
      set({ loading: false })
      setMeshes(items)
    })

    return () => cad.destroy()
  }, [example, set, testParam])

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

const CodeWrapper: React.FC = () => {
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  return <Code data={example.text}></Code>
}
