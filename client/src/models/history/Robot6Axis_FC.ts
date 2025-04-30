/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'
import robotArm from '../../resources/history/Robot6Axis_FC.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type FastenedConstraint = {
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
  xOffset: number
  yOffset: number
  zOffset: number
  xRotation: number
  yRotation: number
  zRotation: number
}

const a1 = 0 // axis 1
const a2 = 1 // axis 2
const a3 = 2 // axis 3
const a4 = 3 // axis 4
const a5 = 4 // axis 5
const a6 = 5 // axis 6

export const paramsMap: Param[] = [
  { index: a1, name: 'Axis Base/J1', type: ParamType.Slider, value: 0, step: 5, values: [0, 360] },
  { index: a2, name: 'Axis J1/J2', type: ParamType.Slider, value: -0, step: 1, values: [-60, 160] },
  { index: a3, name: 'Axis J2/J3', type: ParamType.Slider, value: -0, step: 1, values: [-230, 45] },
  {
    index: a4,
    name: 'Axis J3/J4',
    type: ParamType.Slider,
    value: -0,
    step: 1,
    values: [-180, 180],
  },
  { index: a5, name: 'Axis J4/J5', type: ParamType.Slider, value: -0, step: 1, values: [-90, 90] },
  {
    index: a6,
    name: 'Axis J5/J6',
    type: ParamType.Slider,
    value: -0,
    step: 1,
    values: [-180, 180],
  },
].sort((a, b) => a.index - b.index)

let constraints: FastenedConstraint[] = []

const data = Buffer.from(robotArm).toString('base64') // TODO: how to support ArrayBuffer in the API?

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
    let res = await assemblyApi.getFastened({ id: rootAsm, name: 'Base-J1' })
    const fcBase = res.result as FastenedConstraint
    res = await assemblyApi.getFastened({ id: rootAsm, name: 'J1-J2' })
    const fcJ1 = res.result as FastenedConstraint
    res = await assemblyApi.getFastened({ id: rootAsm, name: 'J2-J3' })
    const fcJ2 = res.result as FastenedConstraint
    res = await assemblyApi.getFastened({ id: rootAsm, name: 'J3-J4' })
    const fcJ3 = res.result as FastenedConstraint
    res = await assemblyApi.getFastened({ id: rootAsm, name: 'J4-J5' })
    const fcJ4 = res.result as FastenedConstraint
    res = await assemblyApi.getFastened({ id: rootAsm, name: 'J5-J6' })
    const fcJ5 = res.result as FastenedConstraint
    constraints = [fcBase, fcJ1, fcJ2, fcJ3, fcJ4, fcJ5]
  }

  return rootAsm
}

export const update: Update = async (model, productId, params) => {
  const { assembly: assemblyApi } = model.api.v1
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update axis
  for (let index = 0; index < 6; index++) {
    if (check(paramsMap[index])) {
      await assemblyApi.updateFastened({ ...constraints[index], zRotation: (params.values[index] / 180) * Math.PI })
    }
  }

  return productId
}

export default { create, update, paramsMap }
