/* eslint-disable react-hooks/exhaustive-deps */
import { solid } from '@buerli.io/headless'
import { Messenger } from '@buerli.io/react'
import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'
import { CCSERVERURL } from '../config'
import Controls from './Controls'
import solidExample from './models/fish'

const Part: React.FC<{ testParam: number }> = props => {
  const scene = useRef<THREE.Scene>()
  const { testParam } = props

  useEffect(() => {
    const cad = new solid(CCSERVERURL)
    cad.init(async api => {
      const items = await solidExample(api)
      for (const item of items) {
        scene.current.add(item)
      }
    })

    return () => {
      cad.destroy()
      if (scene && scene.current) {
        scene.current.children = []
      }
    }
  }, [testParam])

  return <scene ref={scene} />
}

export const SolidApiApp: React.FC<{}> = () => {
  const [testParam, setTestParam] = useState(10)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ width: '100%', height: '5%' }}>
        <label style={{ margin: '5px' }}>Value</label>
        <input type={'number'} value={testParam} onChange={e => setTestParam(Number.parseInt(e.target.value))}></input>
      </div>
      <div style={{ width: '100%', height: '95%' }}>
        <Canvas camera={{ position: [30, 15, 20], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 0, 0]} intensity={0.1} />
          <pointLight position={[0, 20, 0]} intensity={0.5} />
          <pointLight position={[0, 0, 20]} intensity={0.9} />

          <group scale={[0.1, 0.1, 0.1]}>
            <Part testParam={testParam} />
          </group>
          <Controls />
          <axesHelper visible={true} />
        </Canvas>
        <Messenger config={{ placement: 'bottomRight' }} />
      </div>
    </div>
  )
}

export default SolidApiApp
