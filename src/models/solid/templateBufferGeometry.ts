/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Create, GetBufferGeom, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  // Start creating your model here...
  // ...
  // ...

  return 0 // solid id
}

const getBufferGeom: GetBufferGeom = async (model, ids) => {
  if (!model) return
  const meshes: THREE.Mesh[] = []
  ids = Array.isArray(ids) ? ids : [ids]
  for await (const solidId of ids) {
    const geom = await model.createBufferGeometry(solidId)
    const mesh = new THREE.Mesh(
      geom[0],
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 1,
        color: new THREE.Color('rgb(179, 159, 107)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export default { create, getBufferGeom, paramsMap }
