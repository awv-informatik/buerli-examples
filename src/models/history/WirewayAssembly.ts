/* eslint-disable max-lines */
import { BuerliCadFacade } from '@buerli.io/classcad'
import templateSP from '../../resources/history/WirewayTemplate.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type FastenedConstraint = {
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
  zOffset: number
  xRotation: number
  yRotation: number
  zRotation: number
}

const le = 0
const he = 1
const wi = 2
const pd = 3

export const paramsMap: Param[] = [
  { index: le, name: 'Length', type: ParamType.Slider, value: 200, step: 5, values: [100, 400] },
  { index: he, name: 'Height', type: ParamType.Slider, value: 30, step: 5, values: [20, 80] },
  { index: wi, name: 'Width', type: ParamType.Slider, value: 30, step: 5, values: [20, 120] },
  { index: pd, name: 'Position', type: ParamType.Slider, value: 0, step: 5, values: [0, 100] },
].sort((a, b) => a.index - b.index)

let rootNode: number | null
let deckelPrt: number | null = null
let kanalPrt: number | null = null
let constrDeckel: FastenedConstraint

const data = templateSP

export const create: Create = async (model, params) => {
  const { common: commonApi, assembly: assemblyApi } = model.api.v1

  // The global module variables might be set from a previous run --> reset them
  rootNode = null
  deckelPrt = null
  kanalPrt = null
  constrDeckel = undefined

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Load template
  rootNode = (await commonApi.load({ data, format: 'OFB' })).id

  if (rootNode !== null) {
    // Get all needed parts from container
    deckelPrt = (await assemblyApi.getPartTemplate({ name: 'Deckel' })) as number
    kanalPrt = (await assemblyApi.getPartTemplate({ name: 'Kanal' })) as number
    constrDeckel = (await assemblyApi.getFastened({ id: rootNode, name: 'Fastened' })) as FastenedConstraint
    params.values[le] !== paramsMap[le].value && await updateLength(params.values[le], model)
    params.values[wi] !== paramsMap[wi].value && await updateWidth(params.values[wi], model)
    params.values[he] !== paramsMap[he].value && await updateHeight(params.values[he], model)
    params.values[pd] !== paramsMap[pd].value &&
      (await assemblyApi.updateFastened({ ...constrDeckel, zOffset: params.values[pd] }))
  }
  return rootNode
}

export const update: Update = async (model, productId, params) => {
  const { assembly: assemblyApi } = model.api.v1

  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update length
  if (check(paramsMap[le])) {
    await updateLength(params.values[le], model)
  }

  // Update height
  if (check(paramsMap[he])) {
    await updateHeight(params.values[he], model)
  }

  // Update width
  if (check(paramsMap[wi])) {
    await updateWidth(params.values[wi], model)
  }

  // Update pos
  if (check(paramsMap[pd])) {
    await assemblyApi.updateFastened({ ...constrDeckel, zOffset: params.values[pd] })
  }

  return productId
}

const updateLength = async (length: number, model: BuerliCadFacade) => {
  deckelPrt &&
    kanalPrt &&
    (await model.api.v1.part.updateExpression([
      {
        id: deckelPrt,
        toUpdate: [{ name: 'Laenge', value: length }],
      },
      {
        id: kanalPrt,
        toUpdate: [{ name: 'Laenge', value: length }],
      },
    ]))
}

const updateWidth = async (width: number, model: BuerliCadFacade) => {
  deckelPrt &&
    kanalPrt &&
    (await model.api.v1.part.updateExpression([
      {
        id: deckelPrt,
        toUpdate: [{ name: 'Breite', value: width + 3 }],
      },
      {
        id: kanalPrt,
        toUpdate: [{ name: 'Breite', value: width }],
      },
    ]))
}

const updateHeight = async (height: number, model: BuerliCadFacade) => {
  kanalPrt &&
    (await model.api.v1.part.updateExpression({
      id: kanalPrt,
      toUpdate: [
        {
          name: 'Hoehe',
          value: height,
        },
      ],
    }))
}

export default { create, update, paramsMap }
