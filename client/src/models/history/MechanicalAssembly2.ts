/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'
import { CadModel } from '../../CadModel'
import mechAsm from '../../resources/history/MechanicalAssembly2.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type RevoluteConstraint = {
  id: number
  name: string
  mate1: {
    matePath: number[]
    wcsId: number
    flipType: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorientType: '0' | '90' | '180' | '270'
  }
  mate2: {
    matePath: number[]
    wcsId: number
    flipType: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorientType: '0' | '90' | '180' | '270'
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

const data = Buffer.from(mechAsm).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, basemodeler: baseModelerApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const {
    result: { id: rootAsm },
  } = await baseModelerApi.load({ data, format: 'ofb', encoding: 'base64' })

  if (rootAsm !== null) {
    const res = await assemblyApi.getRevolute({ id: rootAsm, name: 'Revolute' })
    constrRevolute = res.result as RevoluteConstraint
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

async function updateRevolute(paramValues: number[], model: CadModel) {
  const angleInRadian = (paramValues[0] / 180) * Math.PI
  await model.api.assembly.update3DConstraintValue({
    id: constrRevolute.id,
    name: 'Z_ROTATION',
    value: angleInRadian,
  })
}

export default { create, update, paramsMap }
