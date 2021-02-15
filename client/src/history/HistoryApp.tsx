import { history } from '@buerli.io/headless'
import { ApiHistory } from '@buerli.io/headless/build/history'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import { CanvasContainer, CanvasContent, ExampleLayout, Options, Spin } from '../shared/components'
import { Code } from '../shared/components/Code'
import { Parameters } from '../shared/components/Parameters'
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
      <div style={{ display: 'grid' }}>
        <Options values={exampleIds} onChange={v => set({ activeExample: v })} active={activeExample} />
        <Parameters />
      </div>
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
  const set = useStore(s => s.set)
  const activeExample = useStore(s => s.activeExample)
  const examples = useStore(s => s.examples)
  const example = useStore(s => s.examples.objs[activeExample])
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])
  const historyApi = React.useRef<ApiHistory>()
  const productId = React.useRef<number>(0)

  React.useEffect(() => {
    setMeshes([])
    set({ loading: true })
    const cad = new history(CCSERVERURL)
    cad.init(async api => {
      historyApi.current = api
      productId.current = await example.create(api)
      const items = await createMeshes(productId.current, api)
      set({ loading: false })
      setMeshes(items)
    })
    return () => cad.destroy()
  }, [example, set])

  React.useEffect(() => {
    historyApi.current && update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [example.params, examples])

  const createMeshes = async (prodId: number, api: ApiHistory) => {
    const geoms = await api.createBufferGeometry(prodId)
    return geoms.map(
      geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') })),
    )
  }

  const update = async () => {
    if (historyApi.current && example.update) {
      await example.update(historyApi.current, productId.current, example.params)
      const items = await createMeshes(productId.current, historyApi.current)
      setMeshes(items)
    }
  }

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
