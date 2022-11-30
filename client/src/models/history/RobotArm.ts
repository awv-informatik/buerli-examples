/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, RevoluteConstraintType } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import robotArm from '../../resources/history/RobotArm.ofb'
import { LimitedValue } from '@buerli.io/classcad'

const a0 = 0 // axis 0
const a1 = 1 // axis 1
const a2 = 2 // axis 2

export const paramsMap: Param[] = [
  { index: a0, name: 'Axis0', type: ParamType.Slider, value: 360, step: 5, values: [0, 360] },
  { index: a1, name: 'Axis1', type: ParamType.Slider, value: -46, step: 1, values: [-135, 135] },
  { index: a2, name: 'Axis2', type: ParamType.Slider, value: -60, step: 1, values: [-135, 135] },
].sort((a, b) => a.index - b.index)

let constrAxis0: RevoluteConstraintType
let constrAxis1: RevoluteConstraintType
let constrAxis2: RevoluteConstraintType

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(robotArm, 'ofb')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    constrAxis0 = await api.getRevoluteConstraint(rootAsm, 'Axis0')
    constrAxis1 = await api.getRevoluteConstraint(rootAsm, 'Axis1')
    constrAxis2 = await api.getRevoluteConstraint(rootAsm, 'Axis2')
  }

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update axis 0
  if (check(paramsMap[a0])) {
    await updateAxis0(params.values, api)
  }

  // Update axis 1
  if (check(paramsMap[a1])) {
    await updateAxis1(params.values, api)
  }

  // Update axis 2
  if (check(paramsMap[a2])) {
    await updateAxis2(params.values[a2], api)
  }

  return productId
}

async function updateAxis0(paramValues: number[], api: ApiHistory) {
  
  const aIR0 = (paramValues[a0] / 180) * Math.PI
  const cv0 = { constrId: constrAxis0.constrId, limitValue: 'zRotationValue' as LimitedValue, value: aIR0}
  const aIR1 = (paramValues[a1]/ 180) * Math.PI
  const cv1 = { constrId: constrAxis1.constrId, limitValue: 'zRotationValue' as LimitedValue, value: aIR1}
  const aIR2 = (paramValues[a2]/ 180) * Math.PI
  const cv2 = { constrId: constrAxis2.constrId, limitValue: 'zRotationValue' as LimitedValue, value: aIR2}

  await api.update3dConstraintValues(cv0, cv1, cv2)
}

async function updateAxis1(paramValues: number[], api: ApiHistory) {
  
  const aIR1 = (paramValues[a1]/ 180) * Math.PI
  const cv1 = { constrId: constrAxis1.constrId, limitValue: 'zRotationValue' as LimitedValue, value: aIR1}
  const aIR2 = (paramValues[a2]/ 180) * Math.PI
  const cv2 = { constrId: constrAxis2.constrId, limitValue: 'zRotationValue' as LimitedValue, value: aIR2}

  await api.update3dConstraintValues(cv1, cv2)
}

async function updateAxis2(angle: number, api: ApiHistory) {
  const angleInRadian = (angle / 180) * Math.PI
  await api.update3dConstraintValue(constrAxis2.constrId, 'zRotationValue' as LimitedValue, angleInRadian)
}

export const cad = new history()

export default { create, update, paramsMap, cad }
