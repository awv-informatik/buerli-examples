import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer from '../../shared/resources/As1Asm.of1'

export const create = async (api: ApiHistory, testParam: number) => {
  const file = new File(['As1Asm.of1'], 'As1Asm.of1', {
    type: 'application/x-binary',
  })
  const asm = await api.loadFile(file, arraybuffer)
  const temp = await api.getPartFromContainer()

  const geoms = await api.createBufferGeometry(asm)
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
