/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, ConstraintType, history } from '@buerli.io/headless'
import * as THREE from 'three'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import robotArm from '../../resources/history/RobotArm.of1'

const a0 = 0  // axis 0
const ad = 1
const wd = 2
const ss = 3
const ns = 4
const pp = 5

export const paramsMap: Param[] = [
  { index: a0, name: 'Axis0', type: ParamType.Slider, value: 0, step: 0.1, values: [0, 2*Math.PI] },
].sort((a, b) => a.index - b.index)

let constrAxis0: ConstraintType

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(robotArm, 'of1')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    constrAxis0 = await api.getConstraint(rootAsm, 'Axis0')
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
    await updateAxis0(params.values[a0], api)
  }

  return productId
}

async function updateAxis0(angle: number, api: ApiHistory) {
  await api.update3dConstraintValue(constrAxis0[0], 'zRotationValue', angle )
}

export const cad = new history()

export default { create, update, paramsMap, cad }
