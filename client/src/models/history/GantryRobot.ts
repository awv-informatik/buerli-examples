/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, History, RevoluteConstraintType, SliderConstraintType } from '@buerli.io/headless'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import gantryRobiAsm from '../../resources/history/GantryRobiAssembly.ofb?buffer'
import { LimitedValue } from '@buerli.io/classcad'

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

// Sequence table
const sequence: Step[] = [
  { xAxis: 0, yAxis: 0, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
  { xAxis: 200, yAxis: -200, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 400, yAxis: -400, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 600, yAxis: -600, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 800, yAxis: -800, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 1000, yAxis: -1000, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 1200, yAxis: -700, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 900, yAxis: -400, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 600, yAxis: -100, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 300, yAxis: 200, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
  { xAxis: 0, yAxis: 500, j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0  },
]

export const paramsMap: Param[] = [
  { index: 0, name: 'Sequence', type: ParamType.Button, value: startSequence },
].sort((a, b) => a.index - b.index)

let xAxis: SliderConstraintType
let yAxis: SliderConstraintType
let j1: RevoluteConstraintType
let j2: RevoluteConstraintType
let j3: RevoluteConstraintType
let j4: RevoluteConstraintType
let j5: RevoluteConstraintType
let j6: RevoluteConstraintType

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(gantryRobiAsm, 'ofb')
  const rootAsm = root ? root[0] : null

  if (rootAsm !== null) {
    xAxis = await api.getSliderConstraint(rootAsm, 'Axis1')
    yAxis = await api.getSliderConstraint(rootAsm, 'Axis2')
    j1 = await api.getRevoluteConstraint(rootAsm, 'Joint1')
    j2 = await api.getRevoluteConstraint(rootAsm, 'Joint2')
    j3 = await api.getRevoluteConstraint(rootAsm, 'Joint3')
    j4 = await api.getRevoluteConstraint(rootAsm, 'Joint4')
    j5 = await api.getRevoluteConstraint(rootAsm, 'Joint5')
    j6 = await api.getRevoluteConstraint(rootAsm, 'Joint6')
  }

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // ...

  return productId
}

async function startSequence(api: ApiHistory) {
  for (const step of sequence) {
    const offsetVal = 'zOffsetValue' as LimitedValue
    const rotVal = 'zRotationValue' as LimitedValue
    // x, y, j1 - j6
    const constrValues = [
      { constrId: xAxis.constrId, paramName: offsetVal, value: step.xAxis },
      { constrId: yAxis.constrId, paramName: offsetVal, value: step.yAxis },
      { constrId: j1.constrId, paramName: rotVal, value: step.j1 },
      { constrId: j2.constrId, paramName: rotVal, value: step.j2 },
      { constrId: j3.constrId, paramName: rotVal, value: step.j3 },
      { constrId: j4.constrId, paramName: rotVal, value: step.j4 },
      { constrId: j5.constrId, paramName: rotVal, value: step.j5 },
      { constrId: j6.constrId, paramName: rotVal, value: step.j6 },
    ]
    await api.update3dConstraintValues(...constrValues)
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

export const cad = new History()

export default { create, update, paramsMap, cad }
