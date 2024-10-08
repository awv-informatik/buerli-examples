import { ApiNoHistory, Solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, Param, ParamType, Update } from '../../store'
import { setObjectColor, setObjectTransparency } from '../../utils/utils'

export const paramsMap: Param[] = [
  { index: 0, name: 'Thickness', type: ParamType.Number, value: 5 },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const x = 25
  const y = 25
  const origin = [0, 0, 0]
  const normal = [1, 0, 0]
  const shape = new THREE.Shape()
  shape.moveTo(x, y)
  shape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)
  shape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)
  shape.quadraticCurveTo(x + 115, y, x + 115, y + 40)
  shape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)
  shape.quadraticCurveTo(x + 50, y + 80, x, y)
  const fish1 = await api.extrude([0, 0, params.values[0]], shape)
  const fish2 = await api.extrude([0, 0, params.values[0]], shape)
  await api.mirror(fish2, origin, normal)
  return [fish1, fish2]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiNoHistory
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    api.clearSolids()
    return create(api, params)
  }
}

export const getScene = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds, { meshPerGeometry: true})
  scene && colorize(solids)
  return scene
}

const colorize = (solids: THREE.Group[]) => {
  setObjectColor(solids[0], new Color('rgb(88, 55, 99)'))
  setObjectColor(solids[1], new Color('rgb(166, 55, 112)'))
  setObjectTransparency(solids[1], 0.5)
}

export const cad = new Solid()

export default { create, getScene, paramsMap, cad }
