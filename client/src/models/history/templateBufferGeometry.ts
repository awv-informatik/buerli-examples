/* eslint-disable @typescript-eslint/no-unused-vars */
import { BuerliCadFacade } from '@buerli.io/classcad'
import * as THREE from 'three'
import { Create, Param } from '../../store'

// Example for a global module variable to show how it has to be reset if you need such variables
let globalVariable: any = 0

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  // If you have global module variables, they have to be reset here
  globalVariable = 0

  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const getBufferGeom = async (productId: number, model: BuerliCadFacade) => {
  if (!model) return
  const geoms = await model.createBufferGeometry(productId)
  return geoms.map(
    geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') })),
  )
}

export default { create, getBufferGeom, paramsMap }
