/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Param, Create, storeApi, Update } from '../../store'
import aBTemplate from '../../resources/history/Zeltbau/ZeltTemplateCreation_NewSketch.ofb?buffer'
import fenster110x70AB from '../../resources/history/Zeltbau/Fenster110_70.ofb?buffer'
import tuere189x128AB from '../../resources/history/Zeltbau/Tuere189_128.ofb?buffer'
import { BooleanOperationType, ccAPI, CCClasses, ExtrusionType } from '@buerli.io/classcad'
import { getDrawing, api as buerliApi } from '@buerli.io/core'

const originPt = { x: 0, y: 0, z: 0 }
const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
const originTransform: Transform = [originPt, xDir, yDir]
const defaultBreiteZelt = 4000
const defaultLaengeZelt = 10000
const defaultErkerBreite = 2670

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const startTime = performance.now()
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const rootAsm = await api.createRootAssembly('RootAsm', { ident: 'RootAsmIdent' })

  if (rootAsm) {
    // Loading standard parts
    await api.loadProduct(fenster110x70AB, 'ofb', { ident: 'Fenster110x70_Ident' })
    await api.loadProduct(tuere189x128AB, 'ofb', { ident: 'Tuere189x128_Ident' })

    // Creating the part templates
    const sL_Part = await createSL(api)
    const sR_Part = await createSR(api)
    const rW_Part = await createRW(api)
    const vW_Einfach_Part = await createVW_Einfach(api)
    const vW_Winkelbau_Part = await createVW_Winkelbau(api)
    const vW_1Erker_Part = await createVW_1Erker(api)
    const vW_2Erker_Part = await createVW_2Erker(api)
    const dach_Part = await createDachGiebel(api)

    // Uncomment for testing purpose only
    // await api.addInstances({
    //   productId: sL_Part,
    //   ownerId: rootAsm,
    //   transformation: originTransform,
    //   name: 'SL_Instance',
    //   options: { ident: 'SL_Instance_Ident' },
    // })
    // await api.addInstances({
    //   productId: sR_Part,
    //   ownerId: rootAsm,
    //   transformation: originTransform,
    //   name: 'SR_Instance',
    //   options: { ident: 'SR_Instance_Ident' },
    // })
    // await api.addInstances({ productId: rW_Part, ownerId: rootAsm, transformation: originTransform, name: 'RW_Instance', options: { ident: 'RW_Instance_Ident'}})
    // await api.addInstances({ productId: vW_Einfach_Part, ownerId: rootAsm, transformation: originTransform, name: 'VW_Instance', options: { ident: 'VW_Instance_Ident'}})
    // await api.addInstances({ productId: vW_Winkelbau_Part, ownerId: rootAsm, transformation: originTransform, name: 'VW_Winkelbau_Instance', options: { ident: 'VW_Winkelbau_Instance_Ident'}})
    // await api.addInstances({ productId: vW_1Erker_Part, ownerId: rootAsm, transformation: originTransform, name: 'vW_1Erker_Instance', options: { ident: 'vW_1Erker_Instance_Ident'}})
    // await api.addInstances({ productId: vW_2Erker_Part, ownerId: rootAsm, transformation: originTransform, name: 'vW_2Erker_Instance', options: { ident: 'vW_2Erker_Instance_Ident'}})
    // await api.addInstances({ productId: dach_Part, ownerId: rootAsm, transformation: originTransform, name: 'Dach_Instance', options: { ident: 'Dach_Instance_Ident'}})

    await save(api, 'ZeltAsmTemplate.ofb')
  }

  const endTime = performance.now()
  console.info(`Creation of 'Zelt' part templates took ${(endTime - startTime).toFixed(0)} milliseconds`)

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
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'SL_Part_Ident' })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'SL')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SL_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SL_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SL_2')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.SLF0_B', 100, 'ExpressionSet.SLF0_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.SLF0_B', 100, 'ExpressionSet.SLF0_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.SLF0_B', 100, 'ExpressionSet.SLF0_H')
  const sL = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, fenster0, fenster1, fenster2])
  await rename(wand_Part, 'SL_Part')
  await colorize(sL)

  return wand_Part
}

const createSR = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'SR_Part_Ident' })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'SR')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SR_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SR_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'SR_2')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.SRF0_B', 100, 'ExpressionSet.SRF0_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.SRF0_B', 100, 'ExpressionSet.SRF0_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.SRF0_B', 100, 'ExpressionSet.SRF0_H')
  const sR = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, fenster0, fenster1, fenster2])
  await rename(wand_Part, 'SR_Part')
  await colorize(sR)
  return wand_Part
}

const createRW = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'RW_Part_Ident' })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'RW')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerRW')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.RWT_B', 'ExpressionSet.RWT_H')
  const rW = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, tuere])
  await rename(wand_Part, 'RW_Part')
  await colorize(rW)
  return wand_Part
}

const createVW_Einfach = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'VW_Einfach_Part_Ident' })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'VW_Einfach')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerVW')
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'VW_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'VW_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'VW_2')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.VWF0_B', 100, 'ExpressionSet.VWF0_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.VWF0_B', 100, 'ExpressionSet.VWF0_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.VWF0_B', 100, 'ExpressionSet.VWF0_H')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.VWT_B', 'ExpressionSet.VWT_H')
  const vW = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [
    wand_Slice,
    tuere,
    fenster0,
    fenster1,
    fenster2,
  ])
  await rename(wand_Part, 'VW_Einfach_Part')
  await colorize(vW)

  return wand_Part
}

const createVW_Winkelbau = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'VW_Winkelbau_Part_Ident' })
  await api.setExpressions({
    partId: wand_Part,
    members: [
      { name: 'FMLength', value: defaultErkerBreite },
      { name: 'FRight', value: defaultLaengeZelt - defaultErkerBreite },
    ],
  })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'VW_1Erker')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerVW')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.VWT_B', 'ExpressionSet.VWT_H')
  const vW = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [wand_Slice, tuere])
  await rename(wand_Part, 'VW_Winkelbau_Part')
  await colorize(vW)

  return wand_Part
}

const createVW_1Erker = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'VW_1Erker_Part_Ident' })
  await api.setExpressions({
    partId: wand_Part,
    members: [{ name: 'FRight', value: defaultLaengeZelt - defaultErkerBreite }],
  })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'VW_1Erker')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Extrusion, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerVW')
  const [wcs0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'EL_0')
  const [wcs1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'EL_1')
  const [wcs2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'EL_2')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.VWT_B', 'ExpressionSet.VWT_H')
  const fenster0 = await api.box(wand_Part, [wcs0], 'ExpressionSet.ELF_B', 100, 'ExpressionSet.ELF_H')
  const fenster1 = await api.box(wand_Part, [wcs1], 'ExpressionSet.EFF_B', 100, 'ExpressionSet.EFF_H')
  const fenster2 = await api.box(wand_Part, [wcs2], 'ExpressionSet.ERF_B', 100, 'ExpressionSet.ERF_H')
  const vW = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [
    wand_Slice,
    tuere,
    fenster0,
    fenster1,
    fenster2,
  ])
  await rename(wand_Part, 'VW_1Erker_Part')
  await colorize(vW)

  return wand_Part
}

const createVW_2Erker = async (api: ApiHistory) => {
  const [wand_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'VW_2Erker_Part_Ident' })
  const [wand_SketchRegion] = await api.getSketchRegion(wand_Part, 'VW_1Erker')
  const [wand2_SketchRegion] = await api.getSketchRegion(wand_Part, 'VW_2Erker')
  const wand_Extrusion = await api.extrusion(wand_Part, wand_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const wand2_Extrusion = await api.extrusion(wand_Part, wand2_SketchRegion, ExtrusionType.UP, 0, 4000, 0, [0, 0, 1], 1)
  const wand_Boolean = await api.boolean(wand_Part, BooleanOperationType.UNION, [wand_Extrusion, wand2_Extrusion])
  const [dach_SheetSR] = await api.getSketchRegion(wand_Part, 'DachSheet')
  const dach_Sheet = await api.extrusion(wand_Part, dach_SheetSR, ExtrusionType.CUSTOM, -500, 6000, 0, [0, 0, -1], 0)
  const wand_Slice = await api.sliceBySheet(wand_Part, wand_Boolean, dach_Sheet, true)
  const [wcs] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'TuerVW')
  const [wcsL0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'EL_0')
  const [wcsL1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'EL_1')
  const [wcsL2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'EL_2')
  const tuere = await api.box(wand_Part, [wcs], 100, 'ExpressionSet.VWT_B', 'ExpressionSet.VWT_H')
  const fensterL0 = await api.box(wand_Part, [wcsL0], 'ExpressionSet.ELF_B', 100, 'ExpressionSet.ELF_H')
  const fensterL1 = await api.box(wand_Part, [wcsL1], 'ExpressionSet.EFF_B', 100, 'ExpressionSet.EFF_H')
  const fensterL2 = await api.box(wand_Part, [wcsL2], 'ExpressionSet.ERF_B', 100, 'ExpressionSet.ERF_H')
  const [wcsR0] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'ER_0')
  const [wcsR1] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'ER_1')
  const [wcsR2] = await api.getWorkGeometry(wand_Part, CCClasses.CCWorkCSys, 'ER_2')
  const fensterR0 = await api.box(wand_Part, [wcsR0], 'ExpressionSet.EL2F_B', 100, 'ExpressionSet.EL2F_H')
  const fensterR1 = await api.box(wand_Part, [wcsR1], 'ExpressionSet.EF2F_B', 100, 'ExpressionSet.EF2F_H')
  const fensterR2 = await api.box(wand_Part, [wcsR2], 'ExpressionSet.ER2F_B', 100, 'ExpressionSet.ER2F_H')
  const vW = await api.boolean(wand_Part, BooleanOperationType.SUBTRACTION, [
    wand_Slice,
    tuere,
    fensterL0,
    fensterL1,
    fensterL2,
    fensterR0,
    fensterR1,
    fensterR2,
  ])
  await rename(wand_Part, 'VW_2Erker_Part')
  await colorize(vW)

  return wand_Part
}

const createDachGiebel = async (api: ApiHistory) => {
  const [dach_Part] = await api.loadProduct(aBTemplate, 'ofb', { ident: 'Dach_Ident' })
  const [dach_SketchRegion] = await api.getSketchRegion(dach_Part, 'Dach')
  await api.extrusion(
    dach_Part,
    dach_SketchRegion,
    ExtrusionType.CUSTOM,
    0,
    '-ExpressionSet.B-ExpressionSet.DUeV-ExpressionSet.FMDepth',
    0,
    [0, 0, 1],
    1,
  )
  await rename(dach_Part, 'Dach_Part')
  return dach_Part
}

const rename = async (id: number, name: string) => {
  const activeDrawing = buerliApi.getState().drawing.active
  await ccAPI.common.setObjectName(activeDrawing, id, name)
}

const colorize = async (operationId: number) => {
  const activeDrawing = buerliApi.getState().drawing.active
  const drawing = getDrawing(activeDrawing)
  const entities: number[] | undefined = drawing.structure.tree[operationId].children
  await ccAPI.baseModeler.setAppearance(activeDrawing, entities, { color: { r: 200, g: 200, b: 200 } })
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
