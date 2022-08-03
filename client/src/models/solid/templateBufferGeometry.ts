import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Param, Create } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  // Start creating your model here...
  // ...
  // ...

  return 0  // solid id
}

export const getBufferGeom = async (solidId: number, api: ApiNoHistory) => {
  if (!api) return
  const geom = await api.createBufferGeometry(solidId)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 120, 255)') }),
  )
  return [mesh]
}

export const cad = new solid() 

export default { create, getBufferGeom, paramsMap, cad }
