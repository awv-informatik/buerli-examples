/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Param, Create } from '../../store'
import { CadModel } from '../../CadModel'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  
  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const getBufferGeom = async (productId: number, model: CadModel) => {
  if (!model) return
  const geoms = await model.createBufferGeometry(productId)
  return geoms.map(
    geom =>
      new THREE.Mesh(
        geom,
        new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') }),
      ),
  )
}

export default { create, getBufferGeom, paramsMap }
