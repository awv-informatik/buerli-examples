/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, RevoluteConstraintType } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import robotArm from '../../resources/history/Robot6Axis.ofb?buffer'
import { LimitedValue } from '@buerli.io/classcad'

const a1 = 0 // axis 1
const a2 = 1 // axis 2
const a3 = 2 // axis 3
const a4 = 3 // axis 4
const a5 = 4 // axis 5
const a6 = 5 // axis 6

export const paramsMap: Param[] = [
  { index: a1, name: 'Axis Base/J1', type: ParamType.Slider, value: 0, step: 5, values: [0, 360] },
  { index: a2, name: 'Axis J1/J2', type: ParamType.Slider, value: -0, step: 1, values: [-60, 160] },
  { index: a3, name: 'Axis J2/J3', type: ParamType.Slider, value: -0, step: 1, values: [-230, 45] },
  {
    index: a4,
    name: 'Axis J3/J4',
    type: ParamType.Slider,
    value: -0,
    step: 1,
    values: [-180, 180],
  },
  { index: a5, name: 'Axis J4/J5', type: ParamType.Slider, value: -0, step: 1, values: [-90, 90] },
  {
    index: a6,
    name: 'Axis J5/J6',
    type: ParamType.Slider,
    value: -0,
    step: 1,
    values: [-180, 180],
  },
].sort((a, b) => a.index - b.index)

let constraints: RevoluteConstraintType[] = []

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(robotArm, 'ofb')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    constraints = [
      await api.getRevoluteConstraint(rootAsm, 'Base-J1'),
      await api.getRevoluteConstraint(rootAsm, 'J1-J2'),
      await api.getRevoluteConstraint(rootAsm, 'J2-J3'),
      await api.getRevoluteConstraint(rootAsm, 'J3-J4'),
      await api.getRevoluteConstraint(rootAsm, 'J4-J5'),
      await api.getRevoluteConstraint(rootAsm, 'J5-J6'),
    ]
  }

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update axis
  if (check(paramsMap[a1])) {
    await updateAxis(params.values, a1, api)
  }

  if (check(paramsMap[a2])) {
    await updateAxis(params.values, a2, api)
  }

  if (check(paramsMap[a3])) {
    await updateAxis(params.values, a3, api)
  }

  if (check(paramsMap[a4])) {
    await updateAxis(params.values, a4, api)
  }

  if (check(paramsMap[a5])) {
    await updateAxis(params.values, a5, api)
  }

  if (check(paramsMap[a6])) {
    await updateAxis(params.values, a6, api)
  }

  return productId
}

async function updateAxis(paramValues: number[], axis: number, api: ApiHistory) {
  const constrValues: { constrId: number; paramName: LimitedValue; value: number }[] = []
  for (let index = axis; index < 6; index++) {
    const angleInRadian = (paramValues[index] / 180) * Math.PI
    const constrValue = {
      constrId: await constraints[index].constrId,
      paramName: 'zRotationValue' as LimitedValue,
      value: angleInRadian,
    }
    constrValues.push(constrValue)
  }
  await api.update3dConstraintValues(...constrValues)
}

export const cad = new history()

export default { create, update, paramsMap, cad }
