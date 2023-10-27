/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Param, Create, storeApi, Update, ParamType } from '../../store'
import zeltAsm from '../../resources/history/Zeltbau/ZeltAsmTemplate_MitDefaultZeltUndDach.ofb?buffer'
import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'

const zType = 0
const zTiefe = 1
const zLaenge = 2
const fLinks = 3
const fRechts = 4
const originPt = { x: 0, y: 0, z: 0 }
const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
const originTransform: Transform = [originPt, xDir, yDir]

// Konstante Werte
const fMiddle = 2670
const fBreite = 1100
const fHoehe = 700

let zeltErkerPrt: number
let zeltEinfachPrt: number
let fensterPrt: number
let dachPrt: number

let zeltInstance: number
let dachInstance: number
let fensterLinksInstances: number[] = []
let fensterRechtsInstances: number[] = []

export const paramsMap: Param[] = [
  { index: zType, name: 'Type', type: ParamType.Enum, value: 0, values: [0, 1, 2, 3] },
  { index: zTiefe, name: 'Zelt Tiefe', type: ParamType.Slider, value: 4000, step: 100, values: [2000, 10000] },
  { index: zLaenge, name: 'Zelt Länge', type: ParamType.Slider, value: 10000, step: 100, values: [3000, 10000] },
  { index: fLinks, name: 'Anzahl Fenster links', type: ParamType.Enum, value: 0, values: [0, 1, 2, 3] },
  { index: fRechts, name: 'Anzahl Fenster rechts', type: ParamType.Enum, value: 0, values: [0, 1, 2, 3] },
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
    ;[zeltErkerPrt] = await api.getPartTemplate('Zelt_Erker')
    ;[zeltEinfachPrt] = await api.getPartTemplate('Zelt_Einfach')
    ;[dachPrt] = await api.getPartTemplate('Dach')
    ;[fensterPrt] = await api.getPartTemplate('Fenster110_70')
    ;[zeltInstance] = await api.getInstance(rootAsm, 'Zelt_Einfach_Inst')
    dachInstance = await api.findInstance({ instanceName: 'Dach_Inst' })
    
  }

  const endTime = performance.now()
  console.info(`Call to create Zeltbau took ${(endTime - startTime).toFixed(0)} milliseconds`)

  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Change zelt
  if (check(paramsMap[zType])) {
    if (zeltInstance) {
      await api.removeInstances({ id: zeltInstance })
    }
    if (params.values[zType] === 0) {
      ;[zeltInstance] = await api.addInstances({
        productId: zeltEinfachPrt,
        ownerId: productId,
        transformation: originTransform,
        name: 'Zelt_Einfach_Inst',
      })
    } else if (params.values[zType] === 1) {
      ;[zeltInstance] = await api.addInstances({
        productId: zeltErkerPrt,
        ownerId: productId,
        transformation: originTransform,
        name: 'Zelt_Erker_Inst',
      })
    }
    const [originWCS] = await api.getWorkGeometry(zeltInstance, CCClasses.CCWorkCSys, 'Origin_WCS')
    await api.createFastenedOriginConstraint(
      productId,
      { matePath: [zeltInstance], wcsId: originWCS, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
      0,
      0,
      0,
      'FOC',
    )
    await updateZeltPrt(params.values, api)
    await updateFensterLinks(params.values, api, productId)
    await updateFensterRechts(params.values, api, productId)
  }

  // Change Zelt part
  if (check(paramsMap[zTiefe]) || check(paramsMap[zLaenge])) {
    await updateZeltPrt(params.values, api)
    await updateFensterLinks(params.values, api, productId)
    await updateFensterRechts(params.values, api, productId)
  }

  // Fenster links
  if (check(paramsMap[fLinks])) {
    await updateZeltPrt(params.values, api)
    await updateFensterLinks(params.values, api, productId)
  }

  // Fenster rechts
  if (check(paramsMap[fRechts])) {
    await updateZeltPrt(params.values, api)
    await updateFensterRechts(params.values, api, productId)
  }

  return productId
}

const updateZeltPrt = async (values: any[], api: ApiHistory) => {
  const [zeltPrt] = await api.getProductsOfInstances([zeltInstance])

  // Anzahl Fenster und deren Offset berechnen
  const zeltTiefe = values[zTiefe]
  const anzFensterLinks = values[fLinks]
  const yOffsetLinks = (zeltTiefe - (anzFensterLinks * fBreite)) / (anzFensterLinks + 1)
  const anzFensterRechts = values[fRechts]
  const yOffsetRechts = (zeltTiefe - (anzFensterRechts * fBreite)) / (anzFensterRechts + 1)

  await api.setExpressions(
    { partId: zeltPrt, members: [
      { name: 'B', value: values[zTiefe] },
      { name: 'SL_0_yOffset', value: anzFensterLinks > 0 ? yOffsetLinks : zeltTiefe + 5000 },
      { name: 'SL_1_yOffset', value: anzFensterLinks > 1 ? (2 * yOffsetLinks) + fBreite : zeltTiefe + 5000 },
      { name: 'SL_2_yOffset', value: anzFensterLinks > 2 ? (3 * yOffsetLinks) + 2 * fBreite : zeltTiefe + 5000 },
      { name: 'SR_0_yOffset', value: anzFensterRechts > 0 ? yOffsetRechts : zeltTiefe + 5000 },
      { name: 'SR_1_yOffset', value: anzFensterRechts > 1 ? (2 * yOffsetRechts) + fBreite : zeltTiefe + 5000 },
      { name: 'SR_2_yOffset', value: anzFensterRechts > 2 ? (3 * yOffsetRechts) + 2 * fBreite : zeltTiefe + 5000 },
      { name: 'L', value: values[zLaenge] },
      { name: 'FLeft', value: values[zLaenge] - fMiddle }  // Erker Sketch nachschieben?
    ]},
    { partId: dachPrt, members: [
      { name: 'B', value: values[zTiefe] },
      { name: 'L', value: values[zLaenge] }
    ]}
  )
}

const updateFensterLinks = async (values: any[], api: ApiHistory, productId: number) => {
  if (fensterLinksInstances.length > 0) {
    const toRemoveInstances = []
    fensterLinksInstances.map(id => toRemoveInstances.push({ id }))
    await api.removeInstances(...toRemoveInstances)
  }

  // Anzahl Fenster und deren Offset berechnen
  const zeltTiefe = values[zTiefe]
  const anzFenster = values[fLinks]
  const yOffset = (zeltTiefe - (anzFenster * fBreite)) / (anzFenster + 1)

  // Create instances and at them at once
  const windowInstancesToAdd = []
  for (let index = 0; index < values[fLinks]; index++) {
    windowInstancesToAdd.push({
      productId: fensterPrt,
      ownerId: productId,
      transformation: [
        { x: 20, y: values[zTiefe] - (((index + 1) * yOffset) + index * fBreite), z: 1800 - fHoehe },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 1, z: 0 }],
      name: 'Fenster_' + index + '_Links',
    })
  }
  fensterLinksInstances = await api.addInstances(...windowInstancesToAdd)
  
  // Connect the instances to the zelt with constraints
  // for (let index = 0; index < windowLeftInstances.length; index++) {
  //   const windowInst = windowLeftInstances[index]
  //   const [fensterWCS] = await api.getWorkGeometry(windowInst, CCClasses.CCWorkCSys, 'WorkCSys')
  //   const [seiteLinksWCS] = await api.getWorkGeometry(zeltInstance, CCClasses.CCWorkCSys, 'SL_' + index + '_WCS')
  //   await api.createFastenedConstraint(
  //     productId,
  //     { matePath: [zeltInstance], wcsId: seiteLinksWCS, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
  //     { matePath: [windowInst], wcsId: fensterWCS, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
  //     0,
  //     0,
  //     0,
  //     'FC_Fenster_' + index + '_Links',
  //   )
  // }
}

const updateFensterRechts = async (values: any[], api: ApiHistory, productId: number) => {
  if (fensterRechtsInstances.length > 0) {
    const toRemoveInstances = []
    fensterRechtsInstances.map(id => toRemoveInstances.push({ id }))
    await api.removeInstances(...toRemoveInstances)
  }

  // Anzahl Fenster und deren Offset berechnen
  const zeltTiefe = values[zTiefe]
  const anzFenster = values[fRechts]
  const yOffset = (zeltTiefe - (anzFenster * fBreite)) / (anzFenster + 1)

  // Create instances and at them at once
  const windowInstancesToAdd = []
  for (let index = 0; index < values[fRechts]; index++) {
    windowInstancesToAdd.push({
      productId: fensterPrt,
      ownerId: productId,
      transformation: [
        { x: values[zLaenge] - 20, y: ((index + 1) * yOffset) + index * fBreite, z: 1800 - fHoehe },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: -1, z: 0 }],
      name: 'Fenster_' + index + '_Rechts',
    })
  }
  fensterRechtsInstances = await api.addInstances(...windowInstancesToAdd)
  
  // Connect the instances to the zelt with constraints
  // for (let index = 0; index < windowLeftInstances.length; index++) {
  //   const windowInst = windowLeftInstances[index]
  //   const [fensterWCS] = await api.getWorkGeometry(windowInst, CCClasses.CCWorkCSys, 'WorkCSys')
  //   const [seiteLinksWCS] = await api.getWorkGeometry(zeltInstance, CCClasses.CCWorkCSys, 'SL_' + index + '_WCS')
  //   await api.createFastenedConstraint(
  //     productId,
  //     { matePath: [zeltInstance], wcsId: seiteLinksWCS, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
  //     { matePath: [windowInst], wcsId: fensterWCS, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
  //     0,
  //     0,
  //     0,
  //     'FC_Fenster_' + index + '_Links',
  //   )
  // }
}

export const cad = new history()

export default { create, update, paramsMap, cad }
