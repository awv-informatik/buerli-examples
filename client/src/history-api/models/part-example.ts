import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiHistory) => {
  const part = api.createPart('Part')
  api.cylinder(part, [], 10, 100)

  const geoms = await api.createBufferGeometry(part)
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
