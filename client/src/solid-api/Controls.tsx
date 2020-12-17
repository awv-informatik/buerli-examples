import React, { useRef } from 'react'
import { ReactThreeFiber, extend, useThree, useFrame } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

declare global {
  type OrbitControlsT = ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: OrbitControlsT
    }
  }
}

extend({ OrbitControls })

export default function Controls() {
  const controls = useRef<OrbitControls>()
  const { camera, gl } = useThree()
  useFrame(() => controls.current && controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}
