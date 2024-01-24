/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, RevoluteConstraintType } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import mechAsm from '../../resources/history/MechanicalAssembly3.ofb?buffer'

export const paramsMap: Param[] = [
  { index: 0, name: 'Handle', type: ParamType.Slider, value: 180, step: 1, values: [0, 360] },
].sort((a, b) => a.index - b.index)

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
    constrRevolute = await api.getRevoluteConstraint(rootAsm, 'Revolute')
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
  await api.update3dConstraintValues({
    constrId: constrRevolute.constrId,
    paramName: 'zRotationValue',
    value: angleInRadian,
  })
}

export const cad = new History()

export default { create, update, paramsMap, cad }
