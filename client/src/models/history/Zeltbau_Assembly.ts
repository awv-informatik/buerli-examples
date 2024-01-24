/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Param, Create, storeApi, Update, ParamType } from '../../store'
import zeltAsm from '../../resources/history/Zeltbau/ZeltAsmTemplate.ofb?buffer'

// Parameter indices
const zType = 0
const zTiefe = 1
const zLaenge = 2
const fLinks = 3
const fRechts = 4
const posTuereVorne = 5

// Consts and default values
const originPt = { x: 0, y: 0, z: 0 }
const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
const originTransform: Transform = [originPt, xDir, yDir]

const fMiddle = 2670
const fBreite = 1100
const fHoehe = 700
const fEinbauhoehe = 1900

const defaultBreiteZelt = 4000
const defaultLaengeZelt = 10000
const defaultErkerBreite = 2670

// Instances
let sL_Instance: number
let sR_Instance: number
let rW_Instance: number
let vW_Instance: number
let dach_Instance: number
let fenster1Links_Instance: number
let fensterLinksInstances: number[] = []
let fenster1Rechts_Instance: number
let fensterRechtsInstances: number[] = []
let tuere_Instance: number

// Parts
let sL_Part: number
let sR_Part: number
let rW_Part: number
let vW_Einfach_Part: number
let vW_Winkelbau_Part: number
let vW_1Erker_Part: number
let vW_2Erker_Part: number
let vW_Parts: number[]
let dach_Part: number
let fenster110x70_Part: number
let tuere189x127_Part: number

export const paramsMap: Param[] = [
  { index: zType, name: 'Type', type: ParamType.Enum, value: 0, values: [0, 1, 2, 3] },
  { index: zTiefe, name: 'Zelt Tiefe', type: ParamType.Slider, value: 4000, step: 100, values: [2000, 10000] },
  { index: zLaenge, name: 'Zelt Länge', type: ParamType.Slider, value: 10000, step: 100, values: [3000, 10000] },
  { index: fLinks, name: 'Anzahl Fenster links', type: ParamType.Enum, value: 1, values: [0, 1, 2, 3] },
  { index: fRechts, name: 'Anzahl Fenster rechts', type: ParamType.Enum, value: 1, values: [0, 1, 2, 3] },
  { index: posTuereVorne, name: 'Position Tuere', type: ParamType.Number, value: 4360 },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const startTime = performance.now()
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(zeltAsm, 'ofb')
  const rootAsm = root ? root[0] : null

  if (rootAsm) {
    // Getting all necessary part to assemble them later
    ;[sL_Part] = await api.getPartTemplate('SL_Part_Ident')
    ;[sR_Part] = await api.getPartTemplate('SR_Part_Ident')
    ;[rW_Part] = await api.getPartTemplate('RW_Part_Ident')
    ;[vW_Einfach_Part] = await api.getPartTemplate('VW_Einfach_Part_Ident')
    ;[vW_Winkelbau_Part] = await api.getPartTemplate('VW_Winkelbau_Part_Ident')
    ;[vW_1Erker_Part] = await api.getPartTemplate('VW_1Erker_Part_Ident')
    ;[vW_2Erker_Part] = await api.getPartTemplate('VW_2Erker_Part_Ident')
    vW_Parts = [vW_Einfach_Part, vW_Winkelbau_Part, vW_1Erker_Part, vW_2Erker_Part]
    ;[dach_Part] = await api.getPartTemplate('Dach_Ident')
    ;[fenster110x70_Part] = await api.getPartTemplate('Fenster110x70_Ident')
    ;[tuere189x127_Part] = await api.getPartTemplate('Tuere189x128_Ident')

    // Some initial positions
    const pos_Fenster1_Links: Transform = [
      { x: 20, y: 2550, z: 1200 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 1, z: 0 },
    ]
    const pos_Fenster1_Rechts: Transform = [
      { x: 9980, y: 1450, z: 1200 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: -1, z: 0 },
    ]
    const pos_Tuere: Transform = [
      { x: params.values[posTuereVorne], y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
    ]

    // Add all initially needed instances to the root assembly
    ;[
      sL_Instance,
      sR_Instance,
      rW_Instance,
      vW_Instance,
      dach_Instance,
      fenster1Links_Instance,
      fenster1Rechts_Instance,
      tuere_Instance,
    ] = await api.addInstances(
      ...[
        {
          productId: sL_Part,
          ownerId: rootAsm,
          transformation: originTransform,
          name: 'SL_Instance',
          options: { ident: 'SL_Instance_Ident' },
        },
        {
          productId: sR_Part,
          ownerId: rootAsm,
          transformation: originTransform,
          name: 'SR_Instance',
          options: { ident: 'SR_Instance_Ident' },
        },
        {
          productId: rW_Part,
          ownerId: rootAsm,
          transformation: originTransform,
          name: 'RW_Instance',
          options: { ident: 'RW_Instance_Ident' },
        },
        {
          productId: vW_Einfach_Part,
          ownerId: rootAsm,
          transformation: originTransform,
          name: 'VW_Instance',
          options: { ident: 'VW_Instance_Ident' },
        },
        {
          productId: dach_Part,
          ownerId: rootAsm,
          transformation: originTransform,
          name: 'Dach_Instance',
          options: { ident: 'Dach_Instance_Ident' },
        },
        {
          productId: fenster110x70_Part,
          ownerId: rootAsm,
          transformation: pos_Fenster1_Links,
          name: 'Fenster1_Links_Instance',
          options: { ident: 'Fenster1_Links_Instance_Ident' },
        },
        {
          productId: fenster110x70_Part,
          ownerId: rootAsm,
          transformation: pos_Fenster1_Rechts,
          name: 'Fenster1_Rechts_Instance',
          options: { ident: 'Fenster1_Rechts_Instance_Ident' },
        },
        {
          productId: tuere189x127_Part,
          ownerId: rootAsm,
          transformation: pos_Tuere,
          name: 'Tuere_Instance',
          options: { ident: 'Tuere_Instance_Ident' },
        },
      ],
    )

    // Add initial window instances to their array
    fensterLinksInstances.push(fenster1Links_Instance)
    fensterRechtsInstances.push(fenster1Rechts_Instance)
  }

  const endTime = performance.now()
  console.info(`Assemble initial 'Zelt' took ${(endTime - startTime).toFixed(0)} milliseconds`)

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[fLinks])) {
    await updateFensterLinks(params.values, api, productId)
  }

  if (check(paramsMap[fRechts])) {
    await updateFensterRechts(params.values, api, productId)
  }

  if (check(paramsMap[posTuereVorne])) {
    await updateTuereVorne(params.values, api, productId)
  }

  if (check(paramsMap[zType])) {
    await updateZeltType(params.values, api, productId)
  }

  return productId
}

const updateZeltType = async (values: any[], api: ApiHistory, productId: number) => {
  await api.removeInstances({ id: 'VW_Instance_Ident' })
  await updateTuereVorne(values, api, productId)
  await api.addInstances({
    productId: vW_Parts[values[zType]],
    ownerId: productId,
    transformation: originTransform,
    name: 'VW_Instance',
    options: { ident: 'VW_Instance_Ident' },
  })
}

const updateTuereVorne = async (values: any[], api: ApiHistory, productId: number) => {
  const startTime = performance.now()
  if (!tuere_Instance) {
    ;[tuere_Instance] = await api.addInstances({
      productId: tuere189x127_Part,
      ownerId: productId,
      transformation: [
        { x: values[posTuereVorne], y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: -1, z: 0 },
      ],
      name: 'Tuere_Vorne_Instance',
    })
  }
  // Create cutouts for windows
  await api.setExpressions({
    partId: vW_Parts[values[zType]],
    members: [{ name: 'TuerVW_Offset', value: values[posTuereVorne] }],
  })

  await api.transformInstances({
    id: tuere_Instance,
    transformation: [
      { x: values[posTuereVorne], y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
    ],
  })
  const endTime = performance.now()
  console.info(`Update Tuere vorne took ${(endTime - startTime).toFixed(0)} milliseconds`)
}

const updateFensterLinks = async (values: any[], api: ApiHistory, productId: number) => {
  // Calculate number of windows and their offset
  const anzFensterLinks = values[fLinks]
  const yOffsetLinks = (defaultBreiteZelt - anzFensterLinks * fBreite) / (anzFensterLinks + 1)

  if (fensterLinksInstances.length > 0) {
    const toRemoveInstances = []
    fensterLinksInstances.map(id => toRemoveInstances.push({ id }))
    await api.removeInstances(...toRemoveInstances)
  }

  // Create cutouts for windows
  await api.setExpressions({
    partId: sL_Part,
    members: [
      { name: 'SL_0_yOffset', value: anzFensterLinks > 0 ? yOffsetLinks : defaultBreiteZelt + 5000 },
      { name: 'SL_1_yOffset', value: anzFensterLinks > 1 ? 2 * yOffsetLinks + fBreite : defaultBreiteZelt + 5000 },
      { name: 'SL_2_yOffset', value: anzFensterLinks > 2 ? 3 * yOffsetLinks + 2 * fBreite : defaultBreiteZelt + 5000 },
    ],
  })

  // Create instances and at them at once
  const windowInstancesToAdd = []
  for (let index = 0; index < values[fLinks]; index++) {
    windowInstancesToAdd.push({
      productId: fenster110x70_Part,
      ownerId: productId,
      transformation: [
        { x: 20, y: values[zTiefe] - ((index + 1) * yOffsetLinks + index * fBreite), z: fEinbauhoehe - fHoehe },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'Fenster_' + index + '_Links_Instance',
    })
  }
  fensterLinksInstances = await api.addInstances(...windowInstancesToAdd)
}

const updateFensterRechts = async (values: any[], api: ApiHistory, productId: number) => {
  // Calculate number of windows and their offset
  const anzFensterRechts = values[fRechts]
  const yOffsetRechts = (defaultBreiteZelt - anzFensterRechts * fBreite) / (anzFensterRechts + 1)

  if (fensterRechtsInstances.length > 0) {
    const toRemoveInstances = []
    fensterRechtsInstances.map(id => toRemoveInstances.push({ id }))
    await api.removeInstances(...toRemoveInstances)
  }

  // Create cutouts for windows
  await api.setExpressions({
    partId: sR_Part,
    members: [
      { name: 'SR_0_yOffset', value: anzFensterRechts > 0 ? yOffsetRechts : defaultBreiteZelt + 5000 },
      { name: 'SR_1_yOffset', value: anzFensterRechts > 1 ? 2 * yOffsetRechts + fBreite : defaultBreiteZelt + 5000 },
      {
        name: 'SR_2_yOffset',
        value: anzFensterRechts > 2 ? 3 * yOffsetRechts + 2 * fBreite : defaultBreiteZelt + 5000,
      },
    ],
  })

  // Create instances and at them at once
  const windowInstancesToAdd = []
  for (let index = 0; index < values[fRechts]; index++) {
    windowInstancesToAdd.push({
      productId: fenster110x70_Part,
      ownerId: productId,
      transformation: [
        { x: values[zLaenge] - 20, y: (index + 1) * yOffsetRechts + index * fBreite, z: fEinbauhoehe - fHoehe },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: -1, z: 0 },
      ],
      name: 'Fenster_' + index + '_Rechts_Instance',
    })
  }
  fensterRechtsInstances = await api.addInstances(...windowInstancesToAdd)
}

export const cad = new history()

export default { create, update, paramsMap, cad }
