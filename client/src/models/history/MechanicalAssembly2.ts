/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, ConstraintType, history } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import mechAsm from '../../resources/history/MechanicalAssembly2.of1'


export const paramsMap: Param[] = [
  { index: 0, name: 'Handle', type: ParamType.Slider, value: 0, step: 1, values: [0, 360] },
].sort((a, b) => a.index - b.index)

let constrRevolute: ConstraintType

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(mechAsm, 'of1')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    constrRevolute = await api.getConstraint(rootAsm, 'Revolute')
  }

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex


  // Update revolute
  if (check(paramsMap[0])) {
    await updateRevolute(params.values, api)
  }

  return productId
}

async function updateRevolute(paramValues: number[], api: ApiHistory) {
  const angleInRadian = (paramValues[0] / 180) * Math.PI
  await api.update3dConstraintValue(constrRevolute[0], 'zRotationValue', angleInRadian)
}

export const cad = new history()

export default { create, update, paramsMap, cad }
