/* eslint-disable max-lines */
import { ApiHistory, history, ConstraintType } from '@buerli.io/headless'
import templateSP from '../../resources/history/WirewayTemplate.ofb'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

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
    name: 'Produktauswahl',
    type: ParamType.Dropdown,
    value: 'Wähle ein Produkt...',
    values: ['40x60', '60x80', '60x120'],
  },
].sort((a, b) => a.index - b.index)

let rootNode: number | null
let deckelPrt: number | null = null
let kanalPrt: number | null = null
let constrDeckel: ConstraintType

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Load template
  const root = await api.load(templateSP, 'ofb')
  rootNode = root ? root[0] : null

  if (rootNode !== null) {
    // Get all needed parts from container
    const tempDeckel = await api.getPartFromContainer('Deckel')
    deckelPrt = tempDeckel ? tempDeckel[0] : null

    const tempKanal = await api.getPartFromContainer('Kanal')
    kanalPrt = tempKanal ? tempKanal[0] : null

    constrDeckel = await api.getConstraint(rootNode, 'Fastened')
  }
  return rootNode
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex
  const activeExample = storeApi.getState().activeExample

  // Update length
  if (check(paramsMap[le])) {
    deckelPrt &&
      kanalPrt &&
      (await api.setExpressions(
        {
          partId: deckelPrt,
          members: [
            {
              name: 'Laenge',
              value: params.values[le],
            },
          ],
        },
        {
          partId: kanalPrt,
          members: [
            {
              name: 'Laenge',
              value: params.values[le],
            },
          ],
        },
      ))
  }

  // Update height
  if (check(paramsMap[he])) {
    kanalPrt &&
      (await api.setExpressions({
        partId: kanalPrt,
        members: [
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
      (await api.setExpressions(
        {
          partId: deckelPrt,
          members: [
            {
              name: 'Breite',
              value: params.values[wi] + 3,
            },
          ],
        },
        {
          partId: kanalPrt,
          members: [
            {
              name: 'Breite',
              value: params.values[wi],
            },
          ],
        },
      ))
  }

  // Update pos
  if (check(paramsMap[pd])) {
    const fcDeckel: {
      constrId: number
      mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
      mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
      xOffset: number
      yOffset: number
      zOffset: number
    } = {
      constrId: constrDeckel[0],
      mate1: {
        matePath: constrDeckel[1][0],
        wcsId: constrDeckel[1][1],
        flip: constrDeckel[1][2],
        reoriented: constrDeckel[1][3],
      },
      mate2: {
        matePath: constrDeckel[2][0],
        wcsId: constrDeckel[2][1],
        flip: constrDeckel[2][2],
        reoriented: constrDeckel[2][3],
      },
      xOffset: constrDeckel[3],
      yOffset: constrDeckel[4],
      zOffset: params.values[pd],
    }

    await api.updateFastenedConstraints(fcDeckel)
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

export const cad = new history()

export default { create, update, paramsMap, cad }
