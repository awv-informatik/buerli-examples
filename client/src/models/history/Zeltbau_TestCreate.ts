/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Param, Create, storeApi, Update } from '../../store'
import aBTemplate from '../../resources/history/Zeltbau/ZeltTemplateCreation.ofb?buffer'
import { BooleanOperationType, CCClasses, ExtrusionType } from '@buerli.io/classcad'

const originPt = { x: 0, y: 0, z: 0 }
const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
const originTransform: Transform = [originPt, xDir, yDir]

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const startTime = performance.now()
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const rootAsm = await api.createRootAssembly('RootAsm', { ident: 'RootAsmIdent'})

  if (rootAsm) {

    const sL_Part = await createSL(api)
    await api.addInstances({ productId: sL_Part, ownerId: rootAsm, transformation: originTransform, name: 'SL_Instance', options: { ident: 'SL_Instance_Ident'}})

    const sR_Part = await createSR(api)
    await api.addInstances({ productId: sR_Part, ownerId: rootAsm, transformation: originTransform, name: 'SR_Instance', options: { ident: 'SR_Instance_Ident'}})

    const rW_Part = await createRW(api)
    await api.addInstances({ productId: rW_Part, ownerId: rootAsm, transformation: originTransform, name: 'RW_Instance', options: { ident: 'RW_Instance_Ident'}})

    const vW_Part = await createVW_Einfach(api)
    await api.addInstances({ productId: vW_Part, ownerId: rootAsm, transformation: originTransform, name: 'VW_Instance', options: { ident: 'VW_Instance_Ident'}})

    const dach_Part = await createDachGiebel(api)
    await api.addInstances({ productId: dach_Part, ownerId: rootAsm, transformation: originTransform, name: 'Dach_Instance', options: { ident: 'Dach_Instance_Ident'}})

    await save(api, 'ZeltAsmTemplate.ofb')
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
  return productId
}

const createSL = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'SL_Part_Ident'})
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'SL')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0,0,1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0,0,-1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SL_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SL_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SL_2')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.SLF0_B', 100, 'ExpressionSet.SLF0_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.SLF0_B', 100, 'ExpressionSet.SLF0_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.SLF0_B', 100, 'ExpressionSet.SLF0_H')
  await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, fenster0, fenster1, fenster2])
  return wand_Part
}

const createSR = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'SR_Part_Ident'})
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'SR')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0,0,1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0,0,-1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SR_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SR_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SR_2')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.SRF0_B', 100, 'ExpressionSet.SRF0_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.SRF0_B', 100, 'ExpressionSet.SRF0_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.SRF0_B', 100, 'ExpressionSet.SRF0_H')
  await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, fenster0, fenster1, fenster2])
  return wand_Part
}

const createRW = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'RW_Part_Ident'})
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'RW')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0,0,1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0,0,-1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerRW')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.RWT_B', 'ExpressionSet.RWT_H')
  await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, tuere])
  return wand_Part
}

const createVW_Einfach = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'VW_Part_Ident'})
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'VW_Einfach')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0,0,1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0,0,-1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerVW')
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'VW_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'VW_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'VW_2')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.VWF0_B', 100, 'ExpressionSet.VWF0_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.VWF0_B', 100, 'ExpressionSet.VWF0_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.VWF0_B', 100, 'ExpressionSet.VWF0_H')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.VWT_B', 'ExpressionSet.VWT_H')
  await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, tuere, fenster0, fenster1, fenster2])
  return wand_Part
}

const createDachGiebel = async (api: ApiHistory) => {
  const [dach_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'Dach_Ident'})
  const [dach_SketchRegion] = await api.getSketchRegion(dach_Part, 'Dach')
  await api.extrusion(dach_Part, dach_SketchRegion, ExtrusionType.CUSTOM, 0, '-ExpressionSet.B-400', 0, [0,0,1], 1)
  return dach_Part
}

const save = async (api: ApiHistory, fileName: string) => {
  const data = await api.save('ofb')
  if (data) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
    link.download = `${fileName}`
    link.click()
  }
}

export const cad = new history()

export default { create, update, paramsMap, cad }
