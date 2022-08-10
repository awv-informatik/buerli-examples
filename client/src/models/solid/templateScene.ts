import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Param, Create } from '../../store'
import { setNodesColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  // Start creating your model here...
  // ...
  // ...

  return 0 // solid id
}

export const getScene = async (solidId: number, api: ApiNoHistory) => {
  if (!api) return
  const scene = await api.createScene(solidId)
  scene && colorize(scene)
  return scene
}

const colorize = (scene: THREE.Scene) => {
  const customRed = new Color('rgb(203, 67, 22)')
  setNodesColor('Solid', customRed, scene)
}

export const cad = new solid()

export default { create, getScene, paramsMap, cad }
