import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer from '../../resources/Cube.of1'

export const create = async (api: ApiHistory) => {
  const file = new File(['Cube.of1'], 'Cube.of1', { type: 'application/x-binary' })
  const part = api.loadProduct(file, arraybuffer)
  const geoms = await api.createBufferGeometry(part)
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
