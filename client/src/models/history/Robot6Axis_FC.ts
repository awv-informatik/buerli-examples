/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, FastenedConstraintType, history } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import robotArm from '../../resources/history/Robot6Axis_FC.ofb?buffer'

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

let constraints: FastenedConstraintType[] = []

export const create: Create = async (apiType, params) => {
  const startTime = performance.now()
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(robotArm, 'ofb')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    constraints = [
      await api.getFastenedConstraint(rootAsm, 'Base-J1'),
      await api.getFastenedConstraint(rootAsm, 'J1-J2'),
      await api.getFastenedConstraint(rootAsm, 'J2-J3'),
      await api.getFastenedConstraint(rootAsm, 'J3-J4'),
      await api.getFastenedConstraint(rootAsm, 'J4-J5'),
      await api.getFastenedConstraint(rootAsm, 'J5-J6'),
    ]
  }
  const endTime = performance.now()
  console.info(`Call to create Robot took ${(endTime - startTime).toFixed(0)} milliseconds`)

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update axis
  for (let index = 0; index < 6; index++) {
    if (check(paramsMap[index])) {
      await api.updateFastenedConstraints({ ...constraints[index], zRotation: (params.values[index] / 180) * Math.PI })
    }
  }

  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }
