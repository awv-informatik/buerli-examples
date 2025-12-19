/* eslint-disable max-lines */
import { BuerliCadFacade } from '@buerli.io/classcad'
import produce from 'immer'
import * as createStore from 'zustand'
import vanillaCreate from 'zustand/vanilla'
import templateSP from '../../resources/history/Wall.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type point = { x: number; y: number; z: number } | [number, number, number]

type Transform = [point, point, point]

type instance = {
  productId: number
  ownerId: number
  transformation: Transform
  name?: string
  isLocal?: boolean
}

///////////////////////////////////////////////////////////////
// INTERNAL STORE
///////////////////////////////////////////////////////////////

type Layer = { name: string; type: string; refId: number; thickness: number; posX: number }

type StoreProps = Readonly<{
  layers: Record<string, { lastRemovedLayer: number; layers: Layer[] }>
  setLayers: (exampleId: string, removedLayer: number, params: Layer[]) => void
}>

const store = vanillaCreate<StoreProps>(set => ({
  layers: {},
  setLayers: (exampleId: string, removedLayer: number, layers: Layer[]) => {
    set(state =>
      produce(state, draft => {
        draft.layers[exampleId] = { lastRemovedLayer: removedLayer, layers }
      }),
    )
  },
}))
createStore.default(store)

///////////////////////////////////////////////////////////////

// Some consts, maybe later also variable?
const verticalBeamThickness: number = 100
const horizontalBeamThickness: number = 60
const wallInsulationWidth: number = 525

const wl = 0
const wh = 1
const di = 2
const gt = 3
const spt = 4
const bwt = 5
const dt = 6
const hlt = 7
const hst = 8
const aL = 9

export const paramsMap: Param[] = [
  { index: wl, name: 'Length', type: ParamType.Number, value: 1000 },
  { index: wh, name: 'Height', type: ParamType.Number, value: 1000 },
  {
    index: gt,
    name: 'Plasterboard Thickness',
    type: ParamType.Slider,
    value: 13,
    step: 1,
    values: [10, 20],
  },
  {
    index: spt,
    name: 'Chipboard Thickness',
    type: ParamType.Slider,
    value: 15,
    step: 1,
    values: [10, 25],
  },
  {
    index: bwt,
    name: 'Wooden Beam Wall Thickness',
    type: ParamType.Slider,
    value: 140,
    step: 1,
    values: [100, 200],
  },
  {
    index: dt,
    name: 'Insulation Thickness',
    type: ParamType.Slider,
    value: 60,
    step: 1,
    values: [40, 80],
  },
  {
    index: hlt,
    name: 'Wooden Slats Thickness',
    type: ParamType.Slider,
    value: 40,
    step: 1,
    values: [20, 60],
  },
  {
    index: hst,
    name: 'Wooden Formwork Thickness',
    type: ParamType.Slider,
    value: 25,
    step: 1,
    values: [20, 30],
  },
  { index: di, name: 'Exploded View', type: ParamType.Slider, value: 0, step: 1, values: [0, 800] },
  {
    index: aL,
    name: 'Add layer',
    type: ParamType.Dropdown,
    value: 'Choose layer...',
    values: ['Plasterboard', 'Chipboard', 'Beamwall', 'Insulation', 'WoodenSlats', 'WoodenFormwork'],
  },
].sort((a, b) => a.index - b.index)

const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
let rootNode: number | null
let currInstances: number[] = []

const posXGipsplatte: number = 0
const posXSpanplatte: number = paramsMap[gt].value
const posXBalkenwand: number = paramsMap[gt].value + paramsMap[spt].value
const posXDaemmung: number = paramsMap[gt].value + paramsMap[spt].value + paramsMap[bwt].value
const posXHolzlattung: number = paramsMap[gt].value + paramsMap[spt].value + paramsMap[bwt].value + paramsMap[dt].value
const posXHolzschalung: number =
  paramsMap[gt].value + paramsMap[spt].value + paramsMap[bwt].value + paramsMap[dt].value + 2 * paramsMap[hlt].value

let gipsplattePrt: number | null = null
let spanplattePrt: number | null = null
let daemmungPrt: number | null = null
let verticalBeamPrt: number | null = null
let horizontalBeamPrt: number | null = null
let wallInsulationPrt: number | null = null
let wallInsulationCustomPrt: number | null = null
let holzlattungPrt: number | null = null
let holzschalungPrt: number | null = null
let balkenwandAsm: number | null = null

let gipsplatteInstance: number | null = null
let spanplatteInstance: number | null = null
let daemmungInstance: number | null = null
let holzlattungInstance: number | null = null
let holzschalungInstance: number | null = null
let balkenwandInstance: number | null = null

let beamInstances: instance[] = []
let beamCustomInstances: instance[] = []
let wallInsulationInstances: instance[] = []
let wallInsulationCustomInstances: instance[] = []
let allInstances: instance[] = []

let activeExampleId: string = ''

const data = templateSP

export const create: Create = async (model, params) => {
  const { common: commonApi, assembly: assemblyApi } = model.api.v1

  // The global module variables might be set from a previous run --> reset them
  rootNode = null
  currInstances = []
  gipsplattePrt = null
  spanplattePrt = null
  daemmungPrt = null
  verticalBeamPrt = null
  horizontalBeamPrt = null
  wallInsulationPrt = null
  wallInsulationCustomPrt = null
  holzlattungPrt = null
  holzschalungPrt = null
  balkenwandAsm = null
  gipsplatteInstance = null
  spanplatteInstance = null
  daemmungInstance = null
  holzlattungInstance = null
  holzschalungInstance = null
  balkenwandInstance = null
  beamInstances = []
  beamCustomInstances = []
  wallInsulationInstances = []
  wallInsulationCustomInstances = []
  allInstances = []
  activeExampleId = ''

  if (!params) {
    activeExampleId = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExampleId].params
  }

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Load template
  rootNode = (await commonApi.load({ data, format: 'OFB' })).id

  if (rootNode !== null) {
    // Get all needed parts from container
    gipsplattePrt = (await assemblyApi.getPartTemplate({ name: 'Gipsplatte' })) as number
    spanplattePrt = (await assemblyApi.getPartTemplate({ name: 'Spanplatte' })) as number
    daemmungPrt = (await assemblyApi.getPartTemplate({ name: 'Daemmung' })) as number
    holzlattungPrt = (await assemblyApi.getPartTemplate({ name: 'Holzlattung' })) as number
    holzschalungPrt = (await assemblyApi.getPartTemplate({ name: 'Holzschalung' })) as number
    horizontalBeamPrt = (await assemblyApi.getPartTemplate({ name: 'HorizontalBeam' })) as number
    verticalBeamPrt = (await assemblyApi.getPartTemplate({ name: 'VerticalBeam' })) as number
    wallInsulationPrt = (await assemblyApi.getPartTemplate({ name: 'Insulation' })) as number
    wallInsulationCustomPrt = (await assemblyApi.getPartTemplate({ name: 'InsulationCustom' })) as number
    balkenwandAsm = (await assemblyApi.getAssemblyTemplate({ name: 'BalkenWandAsm' })) as number

    // Add default instances to root node
    const defaultInstances: instance[] = [
      {
        productId: gipsplattePrt,
        ownerId: rootNode,
        transformation: [{ x: posXGipsplatte, y: 0, z: 0 }, xDir, yDir],
        name: 'Gipsplatte',
      },
      {
        productId: spanplattePrt,
        ownerId: rootNode,
        transformation: [{ x: posXSpanplatte, y: 0, z: 0 }, xDir, yDir],
        name: 'Spanplatte',
      },
      {
        productId: balkenwandAsm,
        ownerId: rootNode,
        transformation: [{ x: posXBalkenwand, y: 0, z: 0 }, xDir, yDir],
        name: 'Balkenwand',
      },
      {
        productId: daemmungPrt,
        ownerId: rootNode,
        transformation: [{ x: posXDaemmung, y: 0, z: 0 }, xDir, yDir],
        name: 'Daemmung',
      },
      {
        productId: holzlattungPrt,
        ownerId: rootNode,
        transformation: [{ x: posXHolzlattung, y: 0, z: 0 }, xDir, yDir],
        name: 'Holzlattung',
      },
      {
        productId: holzschalungPrt,
        ownerId: rootNode,
        transformation: [{ x: posXHolzschalung, y: 0, z: 0 }, xDir, yDir],
        name: 'Holzschalung',
      },
    ]
    const addedInstances = (await assemblyApi.instance(defaultInstances)) as number[]
    gipsplatteInstance = addedInstances[0]
    spanplatteInstance = addedInstances[1]
    balkenwandInstance = addedInstances[2]
    daemmungInstance = addedInstances[3]
    holzlattungInstance = addedInstances[4]
    holzschalungInstance = addedInstances[5]

    const layers: Layer[] = []
    layers.push({
      name: 'Gipsplatte',
      type: 'Plasterboard',
      refId: gipsplatteInstance,
      posX: posXGipsplatte,
      thickness: paramsMap[gt].value,
    })
    layers.push({
      name: 'Spanplatte',
      type: 'Chipboard',
      refId: spanplatteInstance,
      posX: posXSpanplatte,
      thickness: paramsMap[spt].value,
    })
    layers.push({
      name: 'Balkenwand',
      type: 'Beamwall',
      refId: balkenwandInstance,
      posX: posXBalkenwand,
      thickness: paramsMap[bwt].value,
    })
    layers.push({
      name: 'Daemmung',
      type: 'Insulation',
      refId: daemmungInstance,
      posX: posXDaemmung,
      thickness: paramsMap[dt].value,
    })
    layers.push({
      name: 'Holzlattung',
      type: 'WoodenSlats',
      refId: holzlattungInstance,
      posX: posXHolzlattung,
      thickness: 2 * paramsMap[hlt].value,
    })
    layers.push({
      name: 'Holzschalung',
      type: 'WoodenFormwork',
      refId: holzschalungInstance,
      posX: posXHolzschalung,
      thickness: paramsMap[hst].value,
    })

    activeExampleId = storeApi.getState().activeExample
    store.getState().setLayers(activeExampleId, -1, layers)

    // Initial settings
    params.values[gt] !== paramsMap[gt].value && await updateLayer(params.values[gt], params.values, layers, 'Gipsplatte', model)
    params.values[spt] !== paramsMap[spt].value && await updateLayer(params.values[spt], params.values, layers, 'Spanplatte', model)
    params.values[dt] !== paramsMap[dt].value && await updateLayer(params.values[dt], params.values, layers, 'Daemmung', model)
    params.values[hlt] !== paramsMap[hlt].value && await updateLayer(params.values[hlt], params.values, layers, 'Holzlattung', model)
    params.values[hst] !== paramsMap[hst].value && await updateLayer(params.values[hst], params.values, layers, 'Holzschalung', model)
    if (params.values[wl] !== paramsMap[wl].value || params.values[wh] !== paramsMap[wh].value) {
      await updateWallSize(params.values[wl], params.values[wh], params.values, layers, model)
      await updateBalkenwandSize(params.values[wl], params.values[wh], params.values, layers, model)
    }
    params.values[di] !== paramsMap[di].value && await explodeWall(params.values, layers, model)
  }
  return rootNode
}

export const update: Update = async (model, productId, params) => {
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex
  activeExampleId = storeApi.getState().activeExample

  const layers = store.getState().layers[activeExampleId]
  if (layers.lastRemovedLayer > 0) {
    await model.api.assembly.deleteInstance({ ids: [layers.lastRemovedLayer] })
    await transformLayers(layers.layers, params.values, model)
  }

  // Update wall size
  if (check(paramsMap[wl]) || check(paramsMap[wh])) {
    await updateWallSize(params.values[wl], params.values[wh], params.values, layers.layers, model)
  }

  // Update gipsplatte thickness
  if (check(paramsMap[gt])) {
    await updateLayer(params.values[gt], params.values, layers.layers, 'Gipsplatte', model)
  }

  // Update spanplatte thickness
  if (check(paramsMap[spt])) {
    await updateLayer(params.values[spt], params.values, layers.layers, 'Spanplatte', model)
  }

  // Update balkenwand thickness
  if (check(paramsMap[bwt])) {
    await updateLayer(params.values[bwt], params.values, layers.layers, 'Balkenwand', model)
  }

  // Update daemmung thickness
  if (check(paramsMap[dt])) {
    await updateLayer(params.values[dt], params.values, layers.layers, 'Daemmung', model)
  }

  // Update holzlattung thickness
  if (check(paramsMap[hlt])) {
    await updateLayer(params.values[hlt], params.values, layers.layers, 'Holzlattung', model)
  }

  // Update holzschalung thickness
  if (check(paramsMap[hst])) {
    await updateLayer(params.values[hst], params.values, layers.layers, 'Holzschalung', model)
  }

  // Explode wall
  if (check(paramsMap[di])) {
    await explodeWall(params.values, layers.layers, model)
  }

  // Adding a new layer
  if (check(paramsMap[aL])) {
    await addLayer(params.values[aL], params.values, layers.layers, model)
  }

  return productId
}

export default { create, update, paramsMap }

///////////////////////////////////////////////////////////////
// INTERNALS
///////////////////////////////////////////////////////////////

/** Changes the whole wall size */
async function updateWallSize(length: number, height: number, params: any[], layers: Layer[], model: BuerliCadFacade) {
  if (gipsplattePrt && spanplattePrt && daemmungPrt && holzlattungPrt && holzschalungPrt) {
    await updateBalkenwandSize(length, height, params, layers, model)
    const exprSets: {
      id: number
      toUpdate: { name: string; value: number | string }[]
    }[] = [
      {
        id: gipsplattePrt,
        toUpdate: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
      {
        id: spanplattePrt,
        toUpdate: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
      {
        id: daemmungPrt,
        toUpdate: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
      {
        id: holzlattungPrt,
        toUpdate: [
          { name: 'wallLength', value: length },
          { name: 'wallHeight', value: height },
        ],
      },
      {
        id: holzschalungPrt,
        toUpdate: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
    ]
    await model.api.part.updateExpression(exprSets)
  }
}

/** Changes the size of the balkenwand subassembly */
async function updateBalkenwandSize(
  length: number,
  height: number,
  params: any[],
  layers: Layer[],
  model: BuerliCadFacade,
) {
  if (balkenwandAsm && horizontalBeamPrt && verticalBeamPrt && wallInsulationPrt && wallInsulationCustomPrt) {
    const balkenwandInstanceId = layers.find(layer => layer.type === 'Beamwall')?.refId
    const exprSets: {
      id: number
      toUpdate: { name: string; value: number | string }[]
    }[] = [
      {
        id: horizontalBeamPrt,
        toUpdate: [{ name: 'beamLength', value: length }],
      },
      {
        id: verticalBeamPrt,
        toUpdate: [{ name: 'beamLength', value: height - 2 * horizontalBeamThickness }],
      },
      {
        id: wallInsulationPrt,
        toUpdate: [{ name: 'insulationHeight', value: height - 2 * horizontalBeamThickness }],
      },
      {
        id: wallInsulationCustomPrt,
        toUpdate: [{ name: 'insulationHeight', value: height - 2 * horizontalBeamThickness }],
      },
    ]
    if (balkenwandInstanceId) {
      await model.api.assembly.setCurrentInstance({ id: balkenwandInstanceId })
      await model.api.part.updateExpression(exprSets)
      await updateBalkenwandBeams(balkenwandInstanceId, length, model)
      await model.api.assembly.setCurrentInstance({ id: balkenwandInstanceId })
    } else {
      await model.api.assembly.setCurrentProduct({ id: balkenwandAsm })
      await model.api.part.updateExpression(exprSets)
    }
    await model.api.assembly.setCurrentInstance({ id: rootNode })
  }
}

/** Adds beams and wall insulations depending on the wall length */
async function updateBalkenwandBeams(ownerInstance: number, wallLength: number, model: BuerliCadFacade) {
  const distanceBtSegments = verticalBeamThickness + wallInsulationWidth
  let nofBeams = 0
  let nofBeamsCustom = 0
  let nofWallInsulations = 0
  let nofWallInsulationsCustom = 0
  let wallInsulationCustomWidth = 0

  const toFillLength = wallLength - distanceBtSegments - verticalBeamThickness
  const nofBeamInsulationPairs = toFillLength / distanceBtSegments
  nofBeams = Math.floor(nofBeamInsulationPairs)
  nofWallInsulations = Math.floor(nofBeamInsulationPairs)
  let remainFillLength = (nofBeamInsulationPairs - nofBeams) * distanceBtSegments

  // If remainFillLength is 0, we dont have to calculate any custom parts
  if (wallInsulationCustomPrt && remainFillLength !== 0) {
    // If remainFillLength is greater than a minimum, fill it with custom insulation
    if (remainFillLength > verticalBeamThickness + 100) {
      nofBeams = nofBeams + 1
      nofWallInsulationsCustom = 1
      wallInsulationCustomWidth = remainFillLength - verticalBeamThickness
    }
    // Else add one wall insulation less and split remainFillLength into two
    // identical custom wall insulations with a beam between
    else {
      nofWallInsulations = nofWallInsulations - 1
      nofBeamsCustom = 1
      nofWallInsulationsCustom = 2
      remainFillLength =
        wallLength -
        (distanceBtSegments +
          nofBeams * verticalBeamThickness +
          nofWallInsulations * wallInsulationWidth +
          verticalBeamThickness)
      wallInsulationCustomWidth = (remainFillLength - verticalBeamThickness) / 2
    }
    // Configure custom wall insulation part
    await model.api.part.updateExpression({
      id: wallInsulationCustomPrt,
      toUpdate: [
        {
          name: 'insulationLength',
          value: wallInsulationCustomWidth,
        },
      ],
    })
  }

  beamInstances = []
  beamCustomInstances = []
  wallInsulationInstances = []
  wallInsulationCustomInstances = []
  allInstances = []

  // If any added instances already exist, remove them
  await removeInstances(currInstances, model)

  // Create standard vertical beam instances
  if (verticalBeamPrt) {
    const firstPos = {
      x: 0,
      y: distanceBtSegments,
      z: horizontalBeamThickness,
    }
    const instances = await createInstances(
      nofBeams,
      firstPos,
      distanceBtSegments,
      verticalBeamPrt,
      ownerInstance,
      'VerticalBeam',
      true,
    )
    beamInstances.push(...instances)
    allInstances.push(...instances)
  }

  // Create standard wall insulation instances
  if (wallInsulationPrt) {
    const firstPos = {
      x: 0,
      y: distanceBtSegments + verticalBeamThickness,
      z: horizontalBeamThickness,
    }
    const instances = await createInstances(
      nofWallInsulations,
      firstPos,
      distanceBtSegments,
      wallInsulationPrt,
      ownerInstance,
      'Insulation',
      true,
    )
    wallInsulationInstances.push(...instances)
    allInstances.push(...instances)
  }

  // Create custom beam node
  if (verticalBeamPrt) {
    const firstPos = {
      x: 0,
      y:
        (nofBeams + 1) * verticalBeamThickness +
        (nofWallInsulations + 1) * wallInsulationWidth +
        wallInsulationCustomWidth,
      z: horizontalBeamThickness,
    }
    const instances = await createInstances(
      nofBeamsCustom,
      firstPos,
      wallInsulationCustomWidth + verticalBeamThickness,
      verticalBeamPrt,
      ownerInstance,
      'VerticalBeamCustom',
      true,
    )
    beamCustomInstances.push(...instances)
    allInstances.push(...instances)
  }

  // Create custom wall insulation instances
  if (wallInsulationCustomPrt) {
    const firstPos = {
      x: 0,
      y: (nofBeams + 1) * verticalBeamThickness + (nofWallInsulations + 1) * wallInsulationWidth,
      z: horizontalBeamThickness,
    }
    const instances = await createInstances(
      nofWallInsulationsCustom,
      firstPos,
      wallInsulationCustomWidth + verticalBeamThickness,
      wallInsulationCustomPrt,
      ownerInstance,
      'InsulationCustom',
      true,
    )
    wallInsulationCustomInstances.push(...instances)
    allInstances.push(...instances)
  }
  // Add all created instances at once
  currInstances = (await model.api.assembly.instance(allInstances)) as number[]
}

///////////////////////////////////////////////////////////////

/** Changes specific layer thickness and transforms all related layers */
async function updateLayer(
  newThickness: number,
  params: any[],
  layers: Layer[],
  updatedLayer: string,
  model: BuerliCadFacade,
) {
  const tempLayers = [...layers]
  switch (updatedLayer) {
    case 'Gipsplatte':
      if (gipsplattePrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Plasterboard') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await model.api.part.updateExpression({
          id: gipsplattePrt,
          toUpdate: [{ name: 'thickness', value: newThickness }],
        })
        await transformLayers(tempLayers, params, model)
      }
      break

    case 'Spanplatte':
      if (spanplattePrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Chipboard') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await model.api.part.updateExpression({
          id: spanplattePrt,
          toUpdate: [{ name: 'thickness', value: newThickness }],
        })
        await transformLayers(tempLayers, params, model)
      }
      break
    case 'Balkenwand':
      if (verticalBeamPrt && horizontalBeamPrt && wallInsulationPrt && wallInsulationCustomPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Beamwall') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        const exprSets: {
          id: number
          toUpdate: { name: string; value: number | string }[]
        }[] = [
          {
            id: horizontalBeamPrt,
            toUpdate: [{ name: 'beamWidth', value: newThickness }],
          },
          {
            id: verticalBeamPrt,
            toUpdate: [{ name: 'beamWidth', value: newThickness }],
          },
          {
            id: wallInsulationPrt,
            toUpdate: [{ name: 'insulationThickness', value: newThickness }],
          },
          {
            id: wallInsulationCustomPrt,
            toUpdate: [{ name: 'insulationThickness', value: newThickness }],
          },
        ]
        await model.api.part.updateExpression(exprSets)
        await transformLayers(tempLayers, params, model)
      }
      break
    case 'Daemmung':
      if (daemmungPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Insulation') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await model.api.part.updateExpression({
          id: daemmungPrt,
          toUpdate: [{ name: 'thickness', value: newThickness }],
        })
        await transformLayers(tempLayers, params, model)
      }
      break
    case 'Holzlattung':
      if (holzlattungPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'WoodenSlats') {
            tempLayers[i] = { ...tempLayers[i], thickness: 2 * newThickness }
          }
        }
        await model.api.part.updateExpression({
          id: holzlattungPrt,
          toUpdate: [{ name: 'latchThickness', value: newThickness }],
        })
        await transformLayers(tempLayers, params, model)
      }
      break
    case 'Holzschalung':
      if (holzschalungPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'WoodenFormwork') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await model.api.part.updateExpression({
          id: holzschalungPrt,
          toUpdate: [{ name: 'thickness', value: newThickness }],
        })
        await transformLayers(tempLayers, params, model)
      }
      break
    default:
      break
  }
}

async function transformLayers(layers: Layer[], params: any[], model: BuerliCadFacade) {
  const tempLayers = [...layers]
  for (let i = 0; i < tempLayers.length; i++) {
    const posXOfLayerBefore = i - 1 >= 0 ? tempLayers[i - 1].posX : 0
    const thicknessOfLayerBefore = i - 1 >= 0 ? tempLayers[i - 1].thickness : 0
    const explodeDistance = i - 1 >= 0 ? params[di] : 0
    tempLayers[i] = {
      ...tempLayers[i],
      posX: posXOfLayerBefore + thicknessOfLayerBefore + explodeDistance,
    }
    await model.api.assembly.transformInstanceTo({
      id: tempLayers[i].refId,
      transformation: [{ x: tempLayers[i].posX, y: 0, z: 0 }, xDir, yDir],
    })
  }
  store.getState().setLayers(activeExampleId, -1, tempLayers)
}

///////////////////////////////////////////////////////////////

async function addLayer(layerType: string, params: any[], layers: Layer[], model: BuerliCadFacade) {
  const tempLayers = [...layers]
  const lastLayer = tempLayers[tempLayers.length - 1]
  const layerName = layerType + tempLayers.filter(layer => layer.type === layerType).length
  switch (layerType) {
    case 'Plasterboard':
      if (gipsplattePrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedInstance = await model.api.assembly.instance({
          productId: gipsplattePrt,
          ownerId: rootNode,
          transformation,
          name: layerName,
        })
        if (addedInstance) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedInstance as number,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[gt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'Chipboard':
      if (spanplattePrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedInstance = await model.api.assembly.instance({
          productId: spanplattePrt,
          ownerId: rootNode,
          transformation,
          name: layerName,
        })
        if (addedInstance) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedInstance as number,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[spt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'Beamwall':
      if (balkenwandAsm) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedInstance = await model.api.assembly.instance({
          productId: balkenwandAsm,
          ownerId: rootNode,
          transformation,
          name: layerType,
        })
        if (addedInstance) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedInstance as number,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[bwt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
          await updateWallSize(params[wl], params[wh], params, tempLayers, model)
        }
      }
      break
    case 'Insulation':
      if (daemmungPrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedInstance = await model.api.assembly.instance({
          productId: daemmungPrt,
          ownerId: rootNode,
          transformation,
          name: layerType,
        })
        if (addedInstance) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedInstance as number,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[dt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'WoodenSlats':
      if (holzlattungPrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedInstance = await model.api.assembly.instance({
          productId: holzlattungPrt,
          ownerId: rootNode,
          transformation,
          name: layerType,
        })
        if (addedInstance) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedInstance as number,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: 2 * params[hlt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'WoodenFormwork':
      if (holzschalungPrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedInstance = await model.api.assembly.instance({
          productId: holzschalungPrt,
          ownerId: rootNode,
          transformation,
          name: layerType,
        })
        if (addedInstance) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedInstance as number,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[hst],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    default:
      break
  }
}

///////////////////////////////////////////////////////////////

/** Changes the gap between layers to get kind of exploded view */
async function explodeWall(params: any[], layers: Layer[], model: BuerliCadFacade) {
  await transformLayers(layers, params, model)
}

//////////////////// Helpers //////////////////////////////////

async function removeInstances(instances: number[], model: BuerliCadFacade) {
  if (instances.length > 0) {
    await model.api.assembly.deleteInstance({ ids: instances })
  }
}

async function createInstances(
  nof: number,
  firstPos: { x: number; y: number; z: number },
  distance: number,
  productId: number,
  ownerInstance: number,
  name: string,
  isLocal?: boolean,
) {
  const instancesToAdd: instance[] = []
  for (let i = 0; i < nof; i++) {
    if (productId !== null) {
      const pos = {
        x: firstPos.x,
        y: firstPos.y,
        z: firstPos.z,
      }
      instancesToAdd.push({
        productId: productId,
        ownerId: ownerInstance,
        transformation: [pos, xDir, yDir],
        name: name + i,
        isLocal,
      })
      pos.y += i * distance
    }
  }
  return instancesToAdd
}
