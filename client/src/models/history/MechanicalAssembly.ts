/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClassCAD } from '@buerli.io/classcad'
import { Buffer } from 'buffer'
import mechAsm from '../../resources/history/MechanicalAssembly.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

const a0 = 0 // slider
const a1 = 1 // revolute

type SliderConstraint = {
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
  xOffset: number
  yOffset: number
  zOffsetLimits: {
    min: number
    max: number
  }
}

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
  { index: a0, name: 'Cylinder', type: ParamType.Slider, value: 0, step: 1, values: [-15, 10] },
  { index: a1, name: 'Lever', type: ParamType.Slider, value: 305, step: 5, values: [285, 335] },
].sort((a, b) => a.index - b.index)

let constrSlider: SliderConstraint
let constrRevolute: RevoluteConstraint

const data = Buffer.from(mechAsm).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, common: commonApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const { id: rootAsm } = await commonApi.load({ data, format: 'ofb', encoding: 'base64' })

  if (rootAsm !== null) {
    const res = await assemblyApi.getSlider({ id: rootAsm, name: 'Slider' })
    constrSlider = res as SliderConstraint
    const res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Revolute' })
    constrRevolute = res2 as RevoluteConstraint
  }

  return rootAsm
}

export const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update slider
  if (check(paramsMap[a0])) {
    await updateSlider(params.values, model)
  }

  // Update revolute
  if (check(paramsMap[a1])) {
    await updateRevolute(params.values, model)
  }

  return productId
}

async function updateSlider(paramValues: number[], model: ClassCAD) {
  await model.api.assembly.update3DConstraintValue({
    id: constrSlider.id,
    name: 'Z_OFFSET',
    value: paramValues[a0],
  })
}

async function updateRevolute(paramValues: number[], model: ClassCAD) {
  const angleInRadian = (paramValues[a1] / 180) * Math.PI
  await model.api.assembly.update3DConstraintValue({
    id: constrRevolute.id,
    name: 'Z_ROTATION',
    value: angleInRadian,
  })
}

export default { create, update, paramsMap }
