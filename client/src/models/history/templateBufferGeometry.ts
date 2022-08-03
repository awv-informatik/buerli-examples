import { ApiHistory, history } from '@buerli.io/headless'
import * as THREE from 'three'
import { Param, Create } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  // Start creating your model here...
  // ...
  // ...

  return 0  // product id
}

export const getBufferGeom = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const geoms = await api.createBufferGeometry(productId)
  return geoms.map(
    geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') })),
  )
}

export const cad = new history() 

export default { create, getBufferGeom, paramsMap, cad }
