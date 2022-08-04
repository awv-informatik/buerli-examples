import { api as buerliApi } from '@buerli.io/core'
import { ApiHistory, ApiNoHistory } from '@buerli.io/headless'
import { BuerliGeometry, raycastFilter, useBuerli } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import { CanvasContainer, ExampleLayout, Spin } from '.'
import { storeApi, useStore } from '../store'
import { Controls } from './canvas/Controls'
import { Fit, useFit } from './canvas/Fit'
import Lights from './canvas/Lights'
import { Code } from './Code'
import { Sidebar } from './Sidebar'

export const Main: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleIds = useStore(s => s.examples.objs)
  const activeExample = useStore(s => s.activeExample)
  const drawingId = useBuerli(state => state.drawing.active)
  const loading = useStore(s => s.loading)

  React.useEffect(() => {
    document.title = 'buerli-examples'
  }, [])

  return (
    <ExampleLayout>
      <div style={{ display: 'grid' }}>
        <Sidebar examples={exampleIds} onChange={v => set({ activeExample: v })} active={activeExample} />
      </div>
      <CanvasContainer>
        <Canvas
          shadows
          orthographic
          frameloop="demand"
          dpr={[1, 2]}
          raycaster={{ filter: raycastFilter }}
          camera={{ position: [0, 0, 100], fov: 90 }}>
          <Controls makeDefault staticMoving rotateSpeed={2} />
          <Lights drawingId={drawingId} />
          <Fit>
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

export default Main

const Part: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleId = useStore(s => s.activeExample)
  const drawingId = useBuerli(state => state.drawing.active)
  const { update, create, getScene, getBufferGeom, cad } = useStore(s => s.examples.objs[exampleId])
  const params = useStore(s => s.examples.objs[exampleId].params)
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])
  const [scene, setScene] = React.useState<THREE.Scene | null>(null)
  const headlessApi = React.useRef<ApiHistory | ApiNoHistory>()
  const productOrSolidId = React.useRef<number>(0)
  const fit = useFit(f => f.fit)
  const setAPI = useStore(s => s.setAPI)

  React.useEffect(() => {
    headlessApi.current = null
    setMeshes([])
    setScene(null)
    //set({ loading: true })

    cad.init(async api => {
      setAPI(exampleId, api)
      headlessApi.current = api
      try {
        const p = storeApi.getState().examples.objs[storeApi.getState().activeExample].params
        productOrSolidId.current = await create(api, p)
        if (getBufferGeom) {
          const tempMeshes = await getBufferGeom(productOrSolidId.current, api)
          setMeshes(tempMeshes)
        } else if (getScene) {
          const tempScene = await getScene(productOrSolidId.current, api)
          setScene(tempScene)
        }
      } catch (error) {
        setMeshes([])
        setScene(null)
        console.error(JSON.stringify(error))
      } finally {
        fit()
        //set({ loading: false })
      }
    })
    return () => {
      // Remove inactive drawings
      const activeDrawing = buerliApi.getState().drawing.active
      const allDrawings = buerliApi.getState().drawing.ids
      allDrawings.forEach(drawing => {
        if (activeDrawing != drawing) {
          buerliApi.getState().api.removeDrawing(drawing)
        }
      })
      // cad.destroy()
    }
  }, [cad, create, exampleId, fit, getBufferGeom, getScene, setAPI])

  React.useEffect(() => {
    const run = async () => {
      if (headlessApi.current && update && params) {
        //set({ loading: true })
        try {
          productOrSolidId.current = await update(headlessApi.current, productOrSolidId.current, params)
          if (getBufferGeom) {
            const tempMeshes = await getBufferGeom(productOrSolidId.current, headlessApi.current)
            setMeshes(tempMeshes)
          } else if (getScene) {
            const tempScene = await getScene(productOrSolidId.current, headlessApi.current)
            setScene(tempScene)
          }
        } catch (error) {
          setMeshes([])
          setScene(null)
          console.error(JSON.stringify(error))
        } finally {
          //set({ loading: false })
        }
      }
    }
    run()
  }, [update, params, headlessApi, set, getBufferGeom, getScene, fit])

  if (getBufferGeom && meshes) {
    return (
      <group>
        {meshes.map(m => (
          <mesh key={m.uuid} {...m} />
        ))}
      </group>
    )
  } else if (getScene && scene) {
    return (
      <group>
        <primitive object={scene} />
      </group>
    )
  } else {
    return <group>{drawingId && <BuerliGeometry drawingId={drawingId} />}</group>
  }
}

const CodeWrapper: React.FC = () => {
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  return <Code data={example.text}></Code>
}
