import { Canvas } from '@react-three/fiber'
import React from 'react'
import { BuerliGeometry, raycastFilter, useBuerli } from '@buerli.io/react'
import { useStore } from '../buerliGeometry/store'
import { CanvasContainer, ExampleLayout, Options, Spin } from '../shared/components'
import { Parameters } from '../history/components/Parameters'
import Code from '../shared/components/Code'
import { history, ApiHistory } from '@buerli.io/headless'
import { Controls } from './components/Controls'
import Lights from './components/Lights'
import { Fit } from './components/Fit'

// const EXAMPLEKEY = 'Headless.Example.Ident'
// const defaultExample = FLANGEPRT
// const exampleKeys = [FLANGEPRT.name]
// const exampleRefs = { [FLANGEPRT.name]: FLANGEPRT }

export const BuerliGeometryApp: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleIds = useStore(s => s.examples.ids)
  const activeExample = useStore(s => s.activeExample)
  const drawingId = useBuerli((state) => state.drawing.active)
  const loading = useStore(s => s.loading)

  React.useEffect(() => {
    document.title = 'History'
  }, [])

  return (
    <ExampleLayout>
      <div style={{ display: 'grid' }}>
        <Options values={exampleIds} onChange={v => set({ activeExample: v })} active={activeExample} />
        {/* <Parameters /> */}
      </div>
      <CanvasContainer>
        <Canvas orthographic
          frameloop="demand"
          dpr={[1, 2]}
          raycaster={{ filter: raycastFilter }}
          camera={{ position: [0, 0, 500], fov: 90 }} >
          <Controls makeDefault staticMoving rotateSpeed={2} />
          <Lights drawingId={drawingId} />
          <Fit drawingId={drawingId}>
            <Part />
          </Fit>
        </Canvas>
        {loading && <Spin />}
      </CanvasContainer>
      <div>
        <CodeWrapper />
      </div>
    </ExampleLayout>
  )
}

export default BuerliGeometryApp

const Part: React.FC = () => {
  const set = useStore(s => s.set)
  const drawingId = useBuerli((state) => state.drawing.active)
  const activeExample = useStore(s => s.activeExample)
  const { create } = useStore(s => s.examples.objs[activeExample])
  const historyApi = React.useRef<ApiHistory>()

  React.useEffect(() => {
    historyApi.current = null
    const cad = new history()
    cad.init(async api => {
      historyApi.current = api
      try {
        await create(api)
      } catch (error) {
        console.error(JSON.stringify(error))
      }
    })
  }, [create, set, historyApi])
  
  return (
    <group>
      {drawingId && <BuerliGeometry drawingId={drawingId} />}
    </group>
  )
}

const CodeWrapper: React.FC = () => {
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  return <Code data={example.text}></Code>
}
