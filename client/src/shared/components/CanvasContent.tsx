import React, { useRef } from 'react'
import { extend, ReactThreeFiber, useFrame, useThree } from 'react-three-fiber'
import * as THREE from 'three'
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

export const CanvasContent: React.FC<{ children: any; fitContent?: boolean }> = ({ children, fitContent }) => {
  const { camera, gl, size, setDefaultCamera } = useThree()
  const outer = React.useRef<THREE.Group>()
  const inner = React.useRef<THREE.Group>()
  const camRef = React.useRef<THREE.PerspectiveCamera>()
  const controls = useRef<OrbitControls>()

  useFrame(() => controls.current && controls.current.update())

  React.useLayoutEffect(() => {
    if (!inner.current) return
    if (!outer.current) return
    if (!camRef.current) return
    const curCam = camRef.current
    // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/3
    const offset = 1.25
    const boundingBox = new THREE.Box3()
    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(outer.current)
    const center = new THREE.Vector3()
    boundingBox.getCenter(center)
    const bbSize = new THREE.Vector3()
    boundingBox.getSize(bbSize)
    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(bbSize.x, bbSize.y, bbSize.z)
    const fov = curCam.fov * (Math.PI / 180)
    let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2))
    cameraZ *= offset // zoom out a little so that objects don't fill the screen
    const minZ = boundingBox.min.z
    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ
    curCam.far = cameraToFarEdge * 5
    curCam.near = 0.1
    curCam.updateProjectionMatrix()

    if (fitContent) {
      curCam.position.z = center.z + cameraZ
      if (controls.current) {
        // set camera to rotate around center of loaded object
        controls.current.target = center
        // prevent camera from zooming out far enough to create far plane cutoff
        controls.current.maxDistance = cameraToFarEdge * 4
        // save the controls state
        controls.current.saveState()
      } else {
        curCam.lookAt(center)
      }
    }
  }, [children, fitContent])

  React.useEffect(() => {
    if (camRef.current) {
      camRef.current.aspect = size.width / size.height
      camRef.current.updateProjectionMatrix()
    }
  }, [size, camRef])

  React.useLayoutEffect(() => {
    if (camRef.current) {
      const oldCam = camera
      setDefaultCamera(camRef.current as any)
      return () => setDefaultCamera(oldCam)
    }
  }, [camera, camRef, setDefaultCamera])

  return (
    <>
      <group ref={outer}>
        <group ref={inner}>{children}</group>
      </group>

      <ambientLight intensity={0.2} />
      <pointLight position={[20, 0, 0]} intensity={0.1} />
      <pointLight position={[0, 20, 0]} intensity={0.5} />
      <pointLight position={[0, 0, 20]} intensity={0.9} />

      {camRef.current && (
        <orbitControls
          ref={controls}
          args={[camRef.current, gl.domElement]}
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.5}
        />
      )}

      <perspectiveCamera ref={camRef} position={[30, 15, 20]} fov={50}>
        <directionalLight
          position={[30, 10, -30]}
          intensity={1}
          castShadow
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
      </perspectiveCamera>
    </>
  )
}
