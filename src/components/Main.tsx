import { BuerliCadFacade } from '@buerli.io/classcad'
import { api as buerliApi, ObjectID } from '@buerli.io/core'
import { BuerliGeometry, useBuerli } from '@buerli.io/react'
import { GizmoHelper, GizmoViewcube, GizmoViewport } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import { CanvasContainer, ExampleLayout, Spin } from '.'

import { storeApi, useStore } from '../store'
import { Sidebar } from './Sidebar'
import AutoClear from './canvas/AutoClear'
import { Controls } from './canvas/Controls'
import { Fit, useFit } from './canvas/Fit'
import Lights from './canvas/Lights'

export const Main: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleIds = useStore(s => s.examples.objs)
  const activeExample = useStore(s => s.activeExample)
  const drawingId = useBuerli(state => state.drawing.active)
  const busy = useStore(s => s.busy)

  React.useEffect(() => {
    document.title = 'buerli-examples'
  }, [])

  return activeExample ? (
    <div style={{ width: '100%', height: '100%' }}>
      <ExampleLayout>
        <div style={{ width: '320px' }}>
          <Sidebar examples={exampleIds} onChange={v => set({ activeExample: v })} active={activeExample} />
        </div>
        <CanvasContainer>
          <Canvas shadows orthographic frameloop="demand" dpr={[1, 2]} camera={{ position: [0, 0, 100], fov: 90 }}>
            <Controls makeDefault staticMoving rotateSpeed={2} />
            <Lights drawingId={drawingId} />
            <Fit>
              <Part />
            </Fit>
            <AutoClear />
            <GizmoHelper renderPriority={2} alignment="top-right" margin={[80, 80]}>
              <group scale={0.8}>
                <group scale={2.25} position={[-30, -30, -30]} rotation={[0, 0, 0]}>
                  <GizmoViewport
                    disabled
                    axisScale={[0.8, 0.02, 0.02]}
                    axisHeadScale={0.45}
                    hideNegativeAxes
                    labelColor="black"
                  />
                </group>
                <GizmoViewcube
                  font="24px Inter var, Arial, sans-serif"
                  faces={['Right', 'Left', 'Back', 'Front', 'Top', 'Bottom']}
                />
              </group>
            </GizmoHelper>
          </Canvas>
          {busy && <Spin />}
        </CanvasContainer>
      </ExampleLayout>
    </div>
  ) : null
}

export default Main

const Part: React.FC = () => {
  const set = useStore(s => s.set)
  const exampleId = useStore(s => s.activeExample)
  const drawingId = useBuerli(state => state.drawing.active)
  const { update, create, getScene, getBufferGeom } = useStore(s => s.examples.objs[exampleId])
  const params = useStore(s => s.examples.objs[exampleId].params)
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])
  const [scene] = React.useState(() => new THREE.Scene())
  const model = React.useRef<BuerliCadFacade>()
  const productOrSolidIds = React.useRef<ObjectID | ObjectID[]>(0)
  const fit = useFit(f => f.fit)
  const setModel = useStore(s => s.setModel)

  const onSelect = React.useCallback(() => {
    fit()
    set({ busy: false })
  }, [fit, set])

  const onResume = React.useCallback(() => {
    set({ busy: true })
  }, [set])

  React.useEffect(() => {
    model.current = null
    setMeshes([])
    set({ busy: true })

    const run = async () => {
      const m = new BuerliCadFacade()
      await m.connect()
      setModel(exampleId, m)
      model.current = m
      try {
        const p = storeApi.getState().examples.objs[storeApi.getState().activeExample].params
        productOrSolidIds.current = await create(m, p, { onSelect, onResume })
        if (getBufferGeom) {
          const tempMeshes = await getBufferGeom(m, productOrSolidIds.current)
          setMeshes(tempMeshes)
        } else if (getScene) {
          const createdScene = await getScene(m, productOrSolidIds.current)
          scene.copy(createdScene)
        }
      } catch (error) {
        setMeshes([])
        console.error(error)
      } finally {
        set({ busy: false })
        fit()
      }
    }
    run()

    return () => {
      // Remove inactive drawings
      const activeDrawing = buerliApi.getState().drawing.active
      const allDrawings = buerliApi.getState().drawing.ids
      allDrawings.forEach(drawing => {
        if (activeDrawing != drawing) {
          buerliApi.getState().api.removeDrawing(drawing)
        }
      })
      scene.children = []
      productOrSolidIds.current = null
    }
  }, [create, exampleId, fit, getBufferGeom, getScene, onResume, onSelect, scene, set, setModel])

  React.useEffect(() => {
    const run = async () => {
      if (model.current && update && params) {
        set({ busy: true })
        try {
          productOrSolidIds.current = await update(model.current, productOrSolidIds.current, params)
          if (getBufferGeom) {
            const tempMeshes = await getBufferGeom(model.current, productOrSolidIds.current)
            setMeshes(tempMeshes)
          } else if (getScene) {
            const updatedScene = await getScene(model.current, productOrSolidIds.current)
            if (updatedScene) {
              scene.clear()
              scene.copy(updatedScene)
            }
          }
        } catch (error) {
          setMeshes([])
          console.error(error)
        } finally {
          set({ busy: false })
        }
      }
    }
    run()
  }, [update, params, model, set, getBufferGeom, getScene, fit, scene])

  React.useEffect(() => {
    // The following code happens every second (setInterval) and is currently only used by the train station clock example.
    if (exampleId == 'TrainStationClock') {
      const interval = setInterval(async () => {
        if (model.current && update && params && productOrSolidIds.current) {
          try {
            productOrSolidIds.current = await update(model.current, productOrSolidIds.current, params)
            if (getBufferGeom) {
              const tempMeshes = await getBufferGeom(model.current, productOrSolidIds.current)
              setMeshes(tempMeshes)
            } else if (getScene) {
              const updatedScene = await getScene(model.current, productOrSolidIds.current)
              if (updatedScene) {
                scene.clear()
                scene.copy(updatedScene)
              }
            }
          } catch (error) {
            setMeshes([])
            console.error(error)
          }
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [update, params, model, set, getBufferGeom, getScene, fit, scene, exampleId])

  if (getBufferGeom && meshes) {
    return (
      <group>
        {meshes.map(m => (
          <mesh key={m.uuid} {...(m as any)} />
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
    return <group>{drawingId && <BuerliGeometry selection />}</group>
  }
}
