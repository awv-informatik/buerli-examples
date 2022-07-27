import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const b0 = api.box(100, 100, 100)
  const b1 = api.offset(b0, 1)
  const b3 = api.box(80, 80, 80)
  const b2 = api.offset(b3, 5)
  api.subtract(b1, false, b2)
  const cyl1 = api.cylinder(200, 50)
  api.subtract(b1, false, cyl1)
  const cyl2 = api.cylinder(200, 50)
  api.rotateTo(cyl2, [0, Math.PI / 2, 0])
  api.subtract(b1, false, cyl2)
  const cyl3 = api.cylinder(200, 50)
  api.rotateTo(cyl3, [Math.PI / 2, 0, 0])
  api.subtract(b1, false, cyl3)
  api.rotateTo(b1, [Math.PI / 4, Math.PI / 4, 0])
  api.slice(b1, [0, 0, 60], [0, 0, 1])
  api.slice(b1, [0, 0, -60], [0, 0, -1])
  api.slice(b1, [0, 60, 0], [0, 1, 0])
  api.slice(b1, [0, -60, 0], [0, -1, 0])
  api.offset(b1, 2)
  api.rotateTo(b1, [-Math.PI / 4, Math.PI / 4, 0])
  api.slice(b1, [0, 0, 60], [0, 0, 1])
  api.slice(b1, [0, 0, -60], [0, 0, -1])
  api.slice(b1, [0, 60, 0], [0, 1, 0])
  api.slice(b1, [0, -60, 0], [0, -1, 0])
  const geom = await api.createBufferGeometry(b1)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 1,
      color: new THREE.Color('rgb(47, 123, 236)'),
    }),
  )
  return [mesh]
}

export default create
