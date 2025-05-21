/* eslint-disable max-lines */
import templateSP from '../../resources/history/WirewayTemplate.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'
import { Buffer } from 'buffer'

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

const le = 0
const he = 1
const wi = 2
const pd = 3
const pa = 4

export const paramsMap: Param[] = [
  { index: le, name: 'Length', type: ParamType.Slider, value: 200, step: 5, values: [100, 400] },
  { index: he, name: 'Height', type: ParamType.Slider, value: 40, step: 5, values: [20, 80] },
  { index: wi, name: 'Width', type: ParamType.Slider, value: 60, step: 5, values: [20, 120] },
  { index: pd, name: 'Position', type: ParamType.Slider, value: 0, step: 5, values: [0, 100] },
  {
    index: pa,
    name: 'Product Selection',
    type: ParamType.Dropdown,
    value: 'Select a product ...',
    values: ['40x60', '60x80', '60x120'],
  },
].sort((a, b) => a.index - b.index)

let rootNode: number | null
let deckelPrt: number | null = null
let kanalPrt: number | null = null
let constrDeckel: FastenedConstraint

const data = Buffer.from(templateSP).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { common: commonApi, assembly: assemblyApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Load template
  rootNode = (await commonApi.load({ data, format: 'ofb', encoding: 'base64' })).result.id

  if (rootNode !== null) {
    // Get all needed parts from container
    deckelPrt = (await assemblyApi.getPartTemplate({ name: 'Deckel' })).result as number
    kanalPrt = (await assemblyApi.getPartTemplate({ name: 'Kanal' })).result as number
    constrDeckel = (await assemblyApi.getFastened({ id: rootNode, name: 'Fastened' })).result as FastenedConstraint
  }
  return rootNode
}

export const update: Update = async (model, productId, params) => {
  const { part: partApi, assembly: assemblyApi } = model.api.v1

  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex
  const activeExample = storeApi.getState().activeExample

  // Update length
  if (check(paramsMap[le])) {
    deckelPrt &&
      kanalPrt &&
      (await partApi.updateExpression([
        {
          id: deckelPrt,
          toUpdate: [
            {
              name: 'Laenge',
              value: params.values[le],
            },
          ],
        },
        {
          id: kanalPrt,
          toUpdate: [
            {
              name: 'Laenge',
              value: params.values[le],
            },
          ],
        },
      ]))
  }

  // Update height
  if (check(paramsMap[he])) {
    kanalPrt &&
      (await partApi.updateExpression({
        id: kanalPrt,
        toUpdate: [
          {
            name: 'Hoehe',
            value: params.values[he],
          },
        ],
      }))
  }

  // Update width
  if (check(paramsMap[wi])) {
    deckelPrt &&
      kanalPrt &&
      (await partApi.updateExpression([
        {
          id: deckelPrt,
          toUpdate: [
            {
              name: 'Breite',
              value: params.values[wi] + 3,
            },
          ],
        },
        {
          id: kanalPrt,
          toUpdate: [
            {
              name: 'Breite',
              value: params.values[wi],
            },
          ],
        }]
      ))
  }

  // Update pos
  if (check(paramsMap[pd])) {
    await assemblyApi.updateFastened({ ...constrDeckel, zOffset: params.values[pd] })
  }

  // Update produkt
  if (check(paramsMap[pa])) {
    switch (
      params.values[pa] //'40x60', '60x80', '60x120'
    ) {
      case '40x60':
        storeApi.getState().setParam(activeExample, he, 40)
        storeApi.getState().setParam(activeExample, wi, 60)
        break
      case '60x80':
        storeApi.getState().setParam(activeExample, he, 60)
        storeApi.getState().setParam(activeExample, wi, 80)
        break
      case '60x120':
        storeApi.getState().setParam(activeExample, he, 60)
        storeApi.getState().setParam(activeExample, wi, 120)
        break
      default:
        break
    }
  }

  return productId
}

export default { create, update, paramsMap }
