import { ApiHistory } from '@buerli.io/headless'
import { Api, ParamType } from '../../history/store'
import * as THREE from 'three'

export const create = async (api: ApiHistory, params?: ParamType) => {
  const part = api.createPart('Part')
  api.cylinder(part, [], 10, 100)
  const topEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 100 }])
  api.fillet(part, topEdges, 2)
  return part
}

export const getBufferGeom = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const geoms = await api.createBufferGeometry(productId)
  return geoms.map(
    geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(52, 89, 87)') })),
  )
}

export const apiType = Api.HISTORY

export default { create,  getBufferGeom, apiType }
