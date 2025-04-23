/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, GetScene, Param, ParamType, Update } from '../../store'
import { setObjectColor, setObjectTransparency } from '../../utils/utils'

export const paramsMap: Param[] = [{ index: 0, name: 'Thickness', type: ParamType.Number, value: 5 }].sort(
  (a, b) => a.index - b.index,
)

export const create: Create = async (model, params) => {
  const api = model.api.v1

  const origin = [0, 0, 0] as [number, number, number] // TODO: type point = { x: number; y: number; z: number;} | [number, number, number] | number[]
  const normal = [1, 0, 0] as [number, number, number] // TODO: type point = { x: number; y: number; z: number;} | [number, number, number] | number[]
  const direction = [0, 0, params.values[0]] as [number, number, number] // TODO: type point = { x: number; y: number; z: number;} | [number, number, number] | number[]
  const x = 25
  const y = 25
  const shape = new THREE.Shape()
  shape.moveTo(x, y)
  shape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)
  shape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)
  shape.quadraticCurveTo(x + 115, y, x + 115, y + 40)
  shape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)
  shape.quadraticCurveTo(x + 50, y + 80, x, y)

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei as any }) // TODO: fix type in CurveAPI_v1.cclass
  await model.createThreeShape(ccShape, shape)
  const { result: fish1 } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction })
  const { result: fish2 } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction })
  await api.solid.mirror({ id: part, target: { id: fish2 }, originPos: origin, normal: normal })
  return [fish1, fish2]
}

export const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex
  if (check(paramsMap[0])) {
    await model.api.common.clear()
    return create(model, params)
  }
  return undefined
}

export const getScene: GetScene = async (model, ids) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(ids, { meshPerGeometry: false })
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [fish1, fish2] = ids as ObjectID[]
  setObjectColor(nodes[`${fish1}`], new Color('rgb(88, 55, 99)'))
  setObjectColor(nodes[`${fish2}`], new Color('rgb(166, 55, 112)'))
  setObjectTransparency(nodes[`${fish2}`], 0.5)
}

export default { create, getScene, paramsMap }
