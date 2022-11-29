/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, RevoluteConstraintType, SliderConstraintType } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import mechAsm from '../../resources/history/MechanicalAssembly.ofb'

const a0 = 0 // slider
const a1 = 1 // revolute

export const paramsMap: Param[] = [
  { index: a0, name: 'Cylinder', type: ParamType.Slider, value: 0, step: 1, values: [-15, 10] },
  { index: a1, name: 'Lever', type: ParamType.Slider, value: 305, step: 5, values: [285, 335] },
].sort((a, b) => a.index - b.index)

let constrSlider: SliderConstraintType
let constrRevolute: RevoluteConstraintType

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(mechAsm, 'ofb')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    constrSlider = await api.getSliderConstraint(rootAsm, 'Slider')
    constrRevolute = await api.getRevoluteConstraint(rootAsm, 'Revolute')
  }

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update slider
  if (check(paramsMap[a0])) {
    await updateSlider(params.values, api)
  }

  // Update revolute
  if (check(paramsMap[a1])) {
    await updateRevolute(params.values, api)
  }

  return productId
}

async function updateSlider(paramValues: number[], api: ApiHistory) {
  await api.update3dConstraintValue(constrSlider.constrId, 'zOffsetValue', paramValues[a0])
}

async function updateRevolute(paramValues: number[], api: ApiHistory) {
  const angleInRadian = (paramValues[a1] / 180) * Math.PI
  await api.update3dConstraintValue(constrRevolute.constrId, 'zRotationValue', angleInRadian)
}

export const cad = new history()

export default { create, update, paramsMap, cad }
