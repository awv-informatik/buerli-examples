import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const radius: number = 20
  const sphere1 = api.sphere(radius)
  api.moveTo(sphere1, [-70, 0, 70])
  const cyl1 = api.cylinder(140, 10)
  api.moveTo(cyl1, [-70, 0, 0])
  const union = api.union(sphere1, false, cyl1)
  const geom = await api.createBufferGeometry(union)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.8, color: new THREE.Color('rgb(255, 0, 0)') }),
  )
  return [mesh]
}

export default create
