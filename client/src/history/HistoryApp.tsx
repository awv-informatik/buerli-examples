import { api as buerliApi } from '@buerli.io/core'
import { history, ApiHistory, solid, ApiNoHistory } from '@buerli.io/headless'
import { BuerliGeometry, raycastFilter, useBuerli } from '@buerli.io/react'
import { Canvas } from '@react-three/fiber'
import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import { Controls } from '../buerliGeometry/components/Controls'
import { Fit } from '../buerliGeometry/components/Fit'
import Lights from '../buerliGeometry/components/Lights'
import { CanvasContainer, CanvasContent, ExampleLayout, Options, Spin } from '../shared/components'
import { Code } from '../shared/components/Code'
import { Parameters } from './components/Parameters'
import { Api, useStore } from './store'

export const HistoryApp: React.FC = () => {
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
          camera={{ position: [0, 0, 100], fov: 90 }} >
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

export default HistoryApp

const Part: React.FC = () => {
  const set = useStore(s => s.set)
  const activeExample = useStore(s => s.activeExample)
  const drawingId = useBuerli((state) => state.drawing.active)
  const { update, create, params, getScene, getBufferGeom, apiType } = useStore(s => s.examples.objs[activeExample])
  const [meshes, setMeshes] = React.useState<THREE.Mesh[]>([])
  const [scene, setScene] = React.useState<THREE.Scene>()
  const headlessApi = React.useRef<ApiHistory | ApiNoHistory>()
  const productOrSolidId = React.useRef<number>(0)
  const [first, setFirst] = React.useState<boolean>(true)

  // const createMeshes = async (prodId: number, api: ApiHistory) => {
  //   if (!api) return
  //   const geoms = await api.createBufferGeometry(prodId)
  //   return geoms.map(
  //     geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') })),
  //   )
  // }

  React.useEffect(() => {
    headlessApi.current = null
    setFirst(true)
    setMeshes([])
    //set({ loading: true })

    const cad = apiType === Api.HISTORY ? new history() : new solid()
    cad.init(async api => {
      headlessApi.current = api
      try {
        productOrSolidId.current = await create(api)
        if (getBufferGeom) {
          const tempMeshes = await getBufferGeom(productOrSolidId.current, api)
          setMeshes(tempMeshes)
        } else if (getScene) {
          const tempScene = await getScene(productOrSolidId.current, api)
          setScene(tempScene)
        }
        setTimeout(() => void setFirst(false), 50)
      } catch (error) {
        setMeshes([])
        console.error(JSON.stringify(error))
      } finally {
        //set({ loading: false })
      }
    })
    return () => {
      buerliApi.getState().api.setActiveDrawing(null)
      cad.destroy()
    }
  }, [create, set, headlessApi])

  React.useEffect(() => {
    const run = async () => {
      if (headlessApi.current && update && params) {
        //set({ loading: true })
        try {
          await update(headlessApi.current, productOrSolidId.current, params)
          if (getBufferGeom) {
            const tempMeshes = await getBufferGeom(productOrSolidId.current, headlessApi.current)
            setMeshes(tempMeshes)
          } else if (getScene) {
            const tempScene = await getScene(productOrSolidId.current, headlessApi.current)
            setScene(tempScene)
          }
        } catch (error) {
          setMeshes([])
          console.error(JSON.stringify(error))
        } finally {
          //set({ loading: false })
        }
      }
    }
    run()
  }, [update, params, headlessApi, set])

  if (headlessApi.current) {
    if (getBufferGeom && meshes) {
      return (
        <>
            {meshes.map(m => (
              <mesh key={m.uuid} {...m} />
            ))}
        </>
      )
    } else if (getScene && scene) {
      return <primitive object={scene} />
    } else {
      return <group>
        {drawingId && <BuerliGeometry drawingId={drawingId} />}
      </group>
    }
  }
  return null
}

const CodeWrapper: React.FC = () => {
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  return <Code data={example.text}></Code>
}
