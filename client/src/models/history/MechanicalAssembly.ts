/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ApiHistory,
  History,
} from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import mechAsm from '../../resources/history/MechanicalAssembly.ofb?buffer'
import { Buffer } from 'buffer'
import { CadModel } from '../../CadModel'

const a0 = 0 // slider
const a1 = 1 // revolute

type SliderConstraint = {
  id: number;
  name: string;
  mate1: {
      matePath: number[];
      wcsId: number;
      flipType: "X" | "-X" | "Y" | "-Y" | "Z" | "-Z";
      reorientType: "0" | "90" | "180" | "270";
  };
  mate2: {
      matePath: number[];
      wcsId: number;
      flipType: "X" | "-X" | "Y" | "-Y" | "Z" | "-Z";
      reorientType: "0" | "90" | "180" | "270";
  };
  xOffset: number;
  yOffset: number;
  zOffsetLimits: {
      min: number;
      max: number;
  };
}

type RevoluteConstraint = {
  id: number;
  name: string;
  mate1: {
      matePath: number[];
      wcsId: number;
      flipType: "X" | "-X" | "Y" | "-Y" | "Z" | "-Z";
      reorientType: "0" | "90" | "180" | "270";
  };
  mate2: {
      matePath: number[];
      wcsId: number;
      flipType: "X" | "-X" | "Y" | "-Y" | "Z" | "-Z";
      reorientType: "0" | "90" | "180" | "270";
  };
  zOffset: number;
  zRotationLimits: {
      min: number;
      max: number;
  };
}

export const paramsMap: Param[] = [
  { index: a0, name: 'Cylinder', type: ParamType.Slider, value: 0, step: 1, values: [-15, 10] },
  { index: a1, name: 'Lever', type: ParamType.Slider, value: 305, step: 5, values: [285, 335] },
].sort((a, b) => a.index - b.index)

let constrSlider: SliderConstraint
let constrRevolute: RevoluteConstraint

const data = Buffer.from(mechAsm).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, basemodeler: baseModelerApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const { result: { id: rootAsm } } = await baseModelerApi.load({ data, format: 'ofb' })

  if (rootAsm !== null) {
    const res = await assemblyApi.getSlider({ id: rootAsm, name: 'Axis1' })
    constrSlider = res.result as SliderConstraint
    const res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Revolute' })
    constrRevolute = res2.result as RevoluteConstraint
  }

  return rootAsm
}

export const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

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

async function updateSlider(paramValues: number[], model: CadModel) {
  await model.api.assembly.update3DConstraintValue({
    id: constrSlider.id,
    name: 'Z_OFFSET',
    value: paramValues[a0]
  })
}

async function updateRevolute(paramValues: number[], model: CadModel) {
  const angleInRadian = (paramValues[a1] / 180) * Math.PI
  await model.api.assembly.update3DConstraintValue({
    id: constrRevolute.id,
    name: 'Z_ROTATION',
    value: angleInRadian
  })
}

export default { create, update, paramsMap }
