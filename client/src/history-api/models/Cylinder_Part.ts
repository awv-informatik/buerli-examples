import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiHistory, testParam: number) => {
  const part = api.createPart('Part')
  api.cylinder(part, [], 10, 100)
  const topEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 100 }])
  api.fillet(part, topEdges, 2)
  const geoms = await api.createBufferGeometry(part)
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
