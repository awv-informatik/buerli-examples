import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer1 from '../../shared/resources/TestLoadMethodInSolidAPI.of1'
//import arraybuffer2 from '../../resources/ventil.stp'

export const create = async (api: ApiNoHistory) => {
  // Creates a cylinder with height = 50 and diameter = 10
  // const boxId = api.box(20, 20, 20)
  // const cylinderId = api.cylinder(50, 10)
  // api.subtract(boxId, false, cylinderId)
  //api.clearSolid(boxId)
  //api.clearSolid(cylinderId)
  //api.save('C:/temp/example1.of1')

  const meshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = []
  const testSolidsOF1 = await api.load(arraybuffer1, 'of1')
  //const testSolidsSTP = await api.import('C:/04_AWV/CADDaten/TestParts/Box_Fillet.stp')

  for (const testSolid of testSolidsOF1) {
    const geom = await api.createBufferGeometry(testSolid)
    const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({}))
    meshes.push(mesh)
  }

  return meshes
}

export default create
