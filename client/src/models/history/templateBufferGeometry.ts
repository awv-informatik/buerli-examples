/* eslint-disable @typescript-eslint/no-unused-vars */
import { NOID, ObjectID } from '@buerli.io/core'
import { ApiHistory, history } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  // Start creating your model here...
  // ...
  // ...

  return NOID // product id
}

export const getBufferGeom = async (productId: ObjectID, api: ApiHistory) => {
  if (!api) return
  const geoms = await api.createBufferGeometry(productId)
  return geoms.map(
    geom =>
      new THREE.Mesh(
        geom,
        new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') }),
      ),
  )
}

export const cad = new history()

export default { create, getBufferGeom, paramsMap, cad }
