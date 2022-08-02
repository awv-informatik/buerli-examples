import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, Param, Update } from '../../store'
import { setNodesColor } from '../../utils/utils'

export const paramsMap: Param[] = [
  { index: 0, name: 'Thickness', type: 'number', value: 5 },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const x = 25
  const y = 25
  const shape = new THREE.Shape()
  shape.moveTo(x, y)
  shape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)
  shape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)
  shape.quadraticCurveTo(x + 115, y, x + 115, y + 40)
  shape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)
  shape.quadraticCurveTo(x + 50, y + 80, x, y)
  const basicBody = api.extrude([0, 0, params.values[0]], shape)
  return basicBody
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiNoHistory
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    return create(api, params)
  }
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
