/* eslint-disable @typescript-eslint/no-unused-vars */
import { BuerliCadFacade } from '@buerli.io/classcad'
import mechAsm from '../../resources/history/MechanicalAssembly2.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type RevoluteConstraint = {
  id: number
  name: string
  mate1: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  mate2: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  zOffset: number
  zRotationLimits: {
    min: number
    max: number
  }
}

export const paramsMap: Param[] = [
  { index: 0, name: 'Handle', type: ParamType.Slider, value: 0, step: 1, values: [0, 360] },
].sort((a, b) => a.index - b.index)

let constrRevolute: RevoluteConstraint

const data = mechAsm

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, common: commonApi } = model.api.v1

  // The global module variables might be set from a previous run --> reset them
  constrRevolute = undefined

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const { id: rootAsm } = await commonApi.load({ data, format: 'OFB' })

  if (rootAsm !== null) {
    const res = await assemblyApi.getRevolute({ id: rootAsm, name: 'Revolute' })
    constrRevolute = res as RevoluteConstraint
  }

  return rootAsm
}

export const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update revolute
  if (check(paramsMap[0])) {
    await updateRevolute(params.values, model)
  }

  return productId
}

async function updateRevolute(paramValues: number[], model: BuerliCadFacade) {
  const angleInRadian = (paramValues[0] / 180) * Math.PI
  await model.api.assembly.update3DConstraintValue({
    id: constrRevolute.id,
    name: 'Z_ROTATION',
    value: angleInRadian,
  })
}

export default { create, update, paramsMap }
