import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const splinepts = []
  splinepts.push(new THREE.Vector2(70, 20))
  splinepts.push(new THREE.Vector2(80, 90))
  splinepts.push(new THREE.Vector2(-30, 70))
  splinepts.push(new THREE.Vector2(0, 0))
  const splineShape = new THREE.Shape()
  splineShape.moveTo(0, 0)
  splineShape.splineThru(splinepts)
  const basicBody = api.extrude([0, 0, 5], splineShape)
  const geom = await api.createBufferGeometry(basicBody)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 120, 255)') }),
  )
  return [mesh]
}

export default create
