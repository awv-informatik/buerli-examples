import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  // Creates a cylinder with height = 50 and diameter = 10
  const boxId = api.box(20, 20, 20)
  const cylinderId = api.cylinder(50, 10)
  api.subtract(boxId, false, cylinderId)
  //api.clearSolid(boxId)
  //api.clearSolid(cylinderId)
  api.save('C:/temp/example1.of1')
  const geom = await api.createBufferGeometry(boxId)
  const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({}))

  return [mesh]
}

export default create
