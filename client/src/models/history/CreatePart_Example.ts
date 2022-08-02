import { ApiHistory, history } from '@buerli.io/headless'
import { Create, Param } from '../../store'
import * as THREE from 'three'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

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

export const cad = new history()

export default { create,  getBufferGeom, paramsMap, cad }
