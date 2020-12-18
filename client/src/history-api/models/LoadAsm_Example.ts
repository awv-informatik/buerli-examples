import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer from '../../resources/SimpleAssembly.of1'

export const create = async (api: ApiHistory, testParam: number) => {
  const file = new File(['SimpleAssembly.of1'], 'SimpleAssembly.of1', {
    type: 'application/x-binary',
  })
  const part = api.loadProduct(file, arraybuffer)

  const geoms = await api.createBufferGeometry(part)
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
