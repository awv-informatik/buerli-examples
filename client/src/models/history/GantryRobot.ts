/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClassCAD } from '@buerli.io/classcad'
import { History } from '@buerli.io/headless'
import { Buffer } from 'buffer'
import gantryRobiAsm from '../../resources/history/GantryRobiAssembly.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type Step = {
  xAxis: number
  yAxis: number
  j1: number
  j2: number
  j3: number
  j4: number
  j5: number
  j6: number
}

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

// Sequence table
const sequence: Step[] = [
  { xAxis: 0, yAxis: 0, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 200, yAxis: -200, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 400, yAxis: -400, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 600, yAxis: -600, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 800, yAxis: -800, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 1000, yAxis: -1000, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 1200, yAxis: -700, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 900, yAxis: -400, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 600, yAxis: -100, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 300, yAxis: 200, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 0, yAxis: 500, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
]

export const paramsMap: Param[] = [{ index: 0, name: 'Sequence', type: ParamType.Button, value: startSequence }].sort(
  (a, b) => a.index - b.index,
)

let xAxis: SliderConstraint
let yAxis: SliderConstraint
let j1: RevoluteConstraint
let j2: RevoluteConstraint
let j3: RevoluteConstraint
let j4: RevoluteConstraint
let j5: RevoluteConstraint
let j6: RevoluteConstraint

const data = Buffer.from(gantryRobiAsm).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, common: commonApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const {
    result: { id: rootAsm },
  } = await commonApi.load({ data: data, format: 'ofb', ident: 'root', encoding: 'base64' })

  if (rootAsm !== null) {
    let res = await assemblyApi.getSlider({ id: rootAsm, name: 'Axis1' })
    xAxis = res.result as SliderConstraint
    res = await assemblyApi.getSlider({ id: rootAsm, name: 'Axis2' })
    yAxis = res.result as SliderConstraint

    let res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Joint1' })
    j1 = res2.result as RevoluteConstraint
    res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Joint2' })
    j2 = res2.result as RevoluteConstraint
    res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Joint3' })
    j3 = res2.result as RevoluteConstraint
    res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Joint4' })
    j4 = res2.result as RevoluteConstraint
    res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Joint5' })
    j5 = res2.result as RevoluteConstraint
    res2 = await assemblyApi.getRevolute({ id: rootAsm, name: 'Joint6' })
    j6 = res2.result as RevoluteConstraint
  }

  return rootAsm
}

export const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // ...

  return productId
}

async function startSequence(model: ClassCAD) {
  for (const step of sequence) {
    const offsetVal: 'X_OFFSET' | 'Y_OFFSET' | 'Z_OFFSET' | 'Z_ROTATION' = 'Z_OFFSET'
    const rotVal: 'X_OFFSET' | 'Y_OFFSET' | 'Z_OFFSET' | 'Z_ROTATION' = 'Z_ROTATION'
    // x, y, j1 - j6
    const constrValues = [
      { id: xAxis.id, name: offsetVal, value: step.xAxis },
      { id: yAxis.id, name: offsetVal, value: step.yAxis },
      { id: j1.id, name: rotVal, value: step.j1 },
      { id: j2.id, name: rotVal, value: step.j2 },
      { id: j3.id, name: rotVal, value: step.j3 },
      { id: j4.id, name: rotVal, value: step.j4 },
      { id: j5.id, name: rotVal, value: step.j5 },
      { id: j6.id, name: rotVal, value: step.j6 },
    ]
    await model.api.assembly.update3DConstraintValue(constrValues)
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

export const cad = new History()

export default { create, update, paramsMap, cad }
