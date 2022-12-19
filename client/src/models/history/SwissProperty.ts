/* eslint-disable max-lines */
import { ApiHistory, history, Transform } from '@buerli.io/headless'
import produce from 'immer'
import * as createStore from 'zustand'
import vanillaCreate from 'zustand/vanilla'
import templateSP from '../../resources/history/WallTemplate.ofb'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type node = {
  productId: number
  ownerId: number
  transformation: Transform
  name?: string
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
    name: 'Gipsplatte Thickness',
    type: ParamType.Slider,
    value: 13,
    step: 1,
    values: [10, 20],
  },
  {
    index: spt,
    name: 'Spanplatte Thickness',
    type: ParamType.Slider,
    value: 15,
    step: 1,
    values: [10, 25],
  },
  {
    index: bwt,
    name: 'Balkenwand Thickness',
    type: ParamType.Slider,
    value: 140,
    step: 1,
    values: [100, 200],
  },
  {
    index: dt,
    name: 'Daemmung Thickness',
    type: ParamType.Slider,
    value: 60,
    step: 1,
    values: [40, 80],
  },
  {
    index: hlt,
    name: 'Holzlattung Thickness',
    type: ParamType.Slider,
    value: 40,
    step: 1,
    values: [20, 60],
  },
  {
    index: hst,
    name: 'Holzschalung Thickness',
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
    values: ['Gipsplatte', 'Spanplatte', 'Balkenwand', 'Daemmung', 'Holzlattung', 'Holzschalung'],
  },
].sort((a, b) => a.index - b.index)

const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
let rootNode: number | null
let currNodes: number[] = []

const posXGipsplatte: number = 0
const posXSpanplatte: number = paramsMap[gt].value
const posXBalkenwand: number = paramsMap[gt].value + paramsMap[spt].value
const posXDaemmung: number = paramsMap[gt].value + paramsMap[spt].value + paramsMap[bwt].value
const posXHolzlattung: number =
  paramsMap[gt].value + paramsMap[spt].value + paramsMap[bwt].value + paramsMap[dt].value
const posXHolzschalung: number =
  paramsMap[gt].value +
  paramsMap[spt].value +
  paramsMap[bwt].value +
  paramsMap[dt].value +
  2 * paramsMap[hlt].value

let gipsplattePrt: number[] | null = null
let spanplattePrt: number[] | null = null
let daemmungPrt: number[] | null = null
let verticalBeamPrt: number[] | null = null
let horizontalBeamPrt: number[] | null = null
let wallInsulationPrt: number[] | null = null
let wallInsulationCustomPrt: number[] | null = null
let holzlattungPrt: number[] | null = null
let holzschalungPrt: number[] | null = null
let balkenwandAsm: number[] | null = null

let gipsplatteNode: number | null = null
let spanplatteNode: number | null = null
let daemmungNode: number | null = null
let holzlattungNode: number | null = null
let holzschalungNode: number | null = null
let balkenwandNode: number | null = null

let beamNodes: node[] = []
let beamCustomNodes: node[] = []
let wallInsulationNodes: node[] = []
let wallInsulationCustomNodes: node[] = []
let allNodes: node[] = []

let activeExampleId: string = ''

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    activeExampleId = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExampleId].params
  }

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Load template
  const root = await api.load(templateSP, 'ofb')
  rootNode = root ? root[0] : null

  if (rootNode !== null) {
    // Get all needed parts from container
    gipsplattePrt = await api.getPartFromContainer('Gipsplatte')
    spanplattePrt = await api.getPartFromContainer('Spanplatte')
    daemmungPrt = await api.getPartFromContainer('Daemmung')
    holzlattungPrt = await api.getPartFromContainer('Holzlattung')
    holzschalungPrt = await api.getPartFromContainer('Holzschalung')
    horizontalBeamPrt = await api.getPartFromContainer('HorizontalBeam')
    verticalBeamPrt = await api.getPartFromContainer('VerticalBeam')
    wallInsulationPrt = await api.getPartFromContainer('Insulation')
    wallInsulationCustomPrt = await api.getPartFromContainer('InsulationCustom')
    balkenwandAsm = await api.getAssemblyFromContainer('BalkenWandAsm')

    // Add default nodes to root node
    const defaultNodes: node[] = [
      {
        productId: gipsplattePrt[0],
        ownerId: rootNode,
        transformation: [{ x: posXGipsplatte, y: 0, z: 0 }, xDir, yDir],
        name: 'Gipsplatte',
      },
      {
        productId: spanplattePrt[0],
        ownerId: rootNode,
        transformation: [{ x: posXSpanplatte, y: 0, z: 0 }, xDir, yDir],
        name: 'Spanplatte',
      },
      {
        productId: balkenwandAsm[0],
        ownerId: rootNode,
        transformation: [{ x: posXBalkenwand, y: 0, z: 0 }, xDir, yDir],
        name: 'Balkenwand',
      },
      {
        productId: daemmungPrt[0],
        ownerId: rootNode,
        transformation: [{ x: posXDaemmung, y: 0, z: 0 }, xDir, yDir],
        name: 'Daemmung',
      },
      {
        productId: holzlattungPrt[0],
        ownerId: rootNode,
        transformation: [{ x: posXHolzlattung, y: 0, z: 0 }, xDir, yDir],
        name: 'Holzlattung',
      },
      {
        productId: holzschalungPrt[0],
        ownerId: rootNode,
        transformation: [{ x: posXHolzschalung, y: 0, z: 0 }, xDir, yDir],
        name: 'Holzschalung',
      },
    ]
    const addedNodes = await api.addNodes(...defaultNodes)
    gipsplatteNode = addedNodes[0]
    spanplatteNode = addedNodes[1]
    balkenwandNode = addedNodes[2]
    daemmungNode = addedNodes[3]
    holzlattungNode = addedNodes[4]
    holzschalungNode = addedNodes[5]

    const layers: Layer[] = []
    layers.push({
      name: 'Gipsplatte',
      type: 'Gipsplatte',
      refId: gipsplatteNode,
      posX: posXGipsplatte,
      thickness: paramsMap[gt].value,
    })
    layers.push({
      name: 'Spanplatte',
      type: 'Spanplatte',
      refId: spanplatteNode,
      posX: posXSpanplatte,
      thickness: paramsMap[spt].value,
    })
    layers.push({
      name: 'Balkenwand',
      type: 'Balkenwand',
      refId: balkenwandNode,
      posX: posXBalkenwand,
      thickness: paramsMap[bwt].value,
    })
    layers.push({
      name: 'Daemmung',
      type: 'Daemmung',
      refId: daemmungNode,
      posX: posXDaemmung,
      thickness: paramsMap[dt].value,
    })
    layers.push({
      name: 'Holzlattung',
      type: 'Holzlattung',
      refId: holzlattungNode,
      posX: posXHolzlattung,
      thickness: 2 * paramsMap[hlt].value,
    })
    layers.push({
      name: 'Holzschalung',
      type: 'Holzschalung',
      refId: holzschalungNode,
      posX: posXHolzschalung,
      thickness: paramsMap[hst].value,
    })

    activeExampleId = storeApi.getState().activeExample
    store.getState().setLayers(activeExampleId, -1, layers)

    // Initial balkenwand configuration
    await updateBalkenwandSize(params.values[wl], params.values[wh], params.values, layers, api)
  }
  return rootNode
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    return undefined
  }
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex
  activeExampleId = storeApi.getState().activeExample

  const layers = store.getState().layers[activeExampleId]
  if (layers.lastRemovedLayer > 0) {
    await api.removeNode(layers.lastRemovedLayer, productId)
    await transformLayers(layers.layers, params.values, api)
  }

  // Update wall size
  if (check(paramsMap[wl]) || check(paramsMap[wh])) {
    await updateWallSize(params.values[wl], params.values[wh], params.values, layers.layers, api)
  }

  // Update gipsplatte thickness
  if (check(paramsMap[gt])) {
    await updateLayer(params.values[gt], params.values, layers.layers, 'Gipsplatte', api)
  }

  // Update spanplatte thickness
  if (check(paramsMap[spt])) {
    await updateLayer(params.values[spt], params.values, layers.layers, 'Spanplatte', api)
  }

  // Update balkenwand thickness
  if (check(paramsMap[bwt])) {
    await updateLayer(params.values[bwt], params.values, layers.layers, 'Balkenwand', api)
  }

  // Update daemmung thickness
  if (check(paramsMap[dt])) {
    await updateLayer(params.values[dt], params.values, layers.layers, 'Daemmung', api)
  }

  // Update holzlattung thickness
  if (check(paramsMap[hlt])) {
    await updateLayer(params.values[hlt], params.values, layers.layers, 'Holzlattung', api)
  }

  // Update holzschalung thickness
  if (check(paramsMap[hst])) {
    await updateLayer(params.values[hst], params.values, layers.layers, 'Holzschalung', api)
  }

  // Explode wall
  if (check(paramsMap[di])) {
    await explodeWall(params.values, layers.layers, api)
  }

  // Adding a new layer
  if (check(paramsMap[aL])) {
    await addLayer(params.values[aL], params.values, layers.layers, api)
  }

  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }

///////////////////////////////////////////////////////////////
// INTERNALS
///////////////////////////////////////////////////////////////

/** Changes the whole wall size */
async function updateWallSize(
  length: number,
  height: number,
  params: any[],
  layers: Layer[],
  api: ApiHistory,
) {
  if (gipsplattePrt && spanplattePrt && daemmungPrt && holzlattungPrt && holzschalungPrt) {
    await updateBalkenwandSize(length, height, params, layers, api)
    const exprSets: {
      partId: number
      members: { name: string; value: number | string }[]
    }[] = [
      {
        partId: gipsplattePrt[0],
        members: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
      {
        partId: spanplattePrt[0],
        members: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
      {
        partId: daemmungPrt[0],
        members: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
      {
        partId: holzlattungPrt[0],
        members: [
          { name: 'wallLength', value: length },
          { name: 'wallHeight', value: height },
        ],
      },
      {
        partId: holzschalungPrt[0],
        members: [
          { name: 'length', value: length },
          { name: 'height', value: height },
        ],
      },
    ]
    await api.setExpressionSets(...exprSets)
  }
}

/** Changes the size of the balkenwand subassembly */
async function updateBalkenwandSize(
  length: number,
  height: number,
  params: any[],
  layers: Layer[],
  api: ApiHistory,
) {
  if (
    balkenwandAsm &&
    horizontalBeamPrt &&
    verticalBeamPrt &&
    wallInsulationPrt &&
    wallInsulationCustomPrt
  ) {
    const balkenwandNodeId = layers.find(layer => layer.type === 'Balkenwand')?.refId
    const exprSets: {
      partId: number
      members: { name: string; value: number | string }[]
    }[] = [
      {
        partId: horizontalBeamPrt[0],
        members: [{ name: 'beamLength', value: length }],
      },
      {
        partId: verticalBeamPrt[0],
        members: [{ name: 'beamLength', value: height - 2 * horizontalBeamThickness }],
      },
      {
        partId: wallInsulationPrt[0],
        members: [{ name: 'insulationHeight', value: height - 2 * horizontalBeamThickness }],
      },
      {
        partId: wallInsulationCustomPrt[0],
        members: [{ name: 'insulationHeight', value: height - 2 * horizontalBeamThickness }],
      },
    ]
    if (balkenwandNodeId) {
      await api.setCurrentNode(balkenwandNodeId)
      await api.setExpressionSets(...exprSets)
      await updateBalkenwandBeams(balkenwandNodeId, length, api)
      await api.setCurrentNode(balkenwandNodeId)
    } else {
      await api.setCurrentProduct(balkenwandAsm[0])
      await api.setExpressionSets(...exprSets)
    }
    await api.setCurrentNode(rootNode)
  }
}

/** Adds beams and wall insulations depending on the wall length */
async function updateBalkenwandBeams(ownerNode: number, wallLength: number, api: ApiHistory) {
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
    await api.setExpressions(wallInsulationCustomPrt[0], {
      name: 'insulationLength',
      value: wallInsulationCustomWidth,
    })
  }

  beamNodes = []
  beamCustomNodes = []
  wallInsulationNodes = []
  wallInsulationCustomNodes = []
  allNodes = []

  // If any added nodes already exist, remove them
  await removeNodes(currNodes, ownerNode, api)

  // Create standard vertical beam nodes
  if (verticalBeamPrt) {
    const firstPos = {
      x: 0,
      y: distanceBtSegments,
      z: horizontalBeamThickness,
    }
    const nodes = await createNodes(
      nofBeams,
      firstPos,
      distanceBtSegments,
      verticalBeamPrt[0],
      ownerNode,
      'VerticalBeam',
    )
    beamNodes.push(...nodes)
    allNodes.push(...nodes)
  }

  // Create standard wall insulation nodes
  if (wallInsulationPrt) {
    const firstPos = {
      x: 0,
      y: distanceBtSegments + verticalBeamThickness,
      z: horizontalBeamThickness,
    }
    const nodes = await createNodes(
      nofWallInsulations,
      firstPos,
      distanceBtSegments,
      wallInsulationPrt[0],
      ownerNode,
      'Insulation',
    )
    wallInsulationNodes.push(...nodes)
    allNodes.push(...nodes)
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
    const nodes = await createNodes(
      nofBeamsCustom,
      firstPos,
      wallInsulationCustomWidth + verticalBeamThickness,
      verticalBeamPrt[0],
      ownerNode,
      'VerticalBeamCustom',
    )
    beamCustomNodes.push(...nodes)
    allNodes.push(...nodes)
  }

  // Create custom wall insulation nodes
  if (wallInsulationCustomPrt) {
    const firstPos = {
      x: 0,
      y: (nofBeams + 1) * verticalBeamThickness + (nofWallInsulations + 1) * wallInsulationWidth,
      z: horizontalBeamThickness,
    }
    const nodes = await createNodes(
      nofWallInsulationsCustom,
      firstPos,
      wallInsulationCustomWidth + verticalBeamThickness,
      wallInsulationCustomPrt[0],
      ownerNode,
      'InsulationCustom',
    )
    wallInsulationCustomNodes.push(...nodes)
    allNodes.push(...nodes)
  }
  // Add all created nodes at once
  currNodes = await api.addNodes(...allNodes)
}

///////////////////////////////////////////////////////////////

/** Changes specific layer thickness and transforms all related layers */
async function updateLayer(
  newThickness: number,
  params: any[],
  layers: Layer[],
  updatedLayer: string,
  api: ApiHistory,
) {
  const tempLayers = [...layers]
  switch (updatedLayer) {
    case 'Gipsplatte':
      if (gipsplattePrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Gipsplatte') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await api.setExpressions(gipsplattePrt[0], { name: 'thickness', value: newThickness })
        await transformLayers(tempLayers, params, api)
      }
      break

    case 'Spanplatte':
      if (spanplattePrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Spanplatte') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await api.setExpressions(spanplattePrt[0], { name: 'thickness', value: newThickness })
        await transformLayers(tempLayers, params, api)
      }
      break
    case 'Balkenwand':
      if (verticalBeamPrt && horizontalBeamPrt && wallInsulationPrt && wallInsulationCustomPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Balkenwand') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        const exprSets: {
          partId: number
          members: { name: string; value: number | string }[]
        }[] = [
          {
            partId: horizontalBeamPrt[0],
            members: [{ name: 'beamWidth', value: newThickness }],
          },
          {
            partId: verticalBeamPrt[0],
            members: [{ name: 'beamWidth', value: newThickness }],
          },
          {
            partId: wallInsulationPrt[0],
            members: [{ name: 'insulationThickness', value: newThickness }],
          },
          {
            partId: wallInsulationCustomPrt[0],
            members: [{ name: 'insulationThickness', value: newThickness }],
          },
        ]
        await api.setExpressionSets(...exprSets)
        await transformLayers(tempLayers, params, api)
      }
      break
    case 'Daemmung':
      if (daemmungPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Daemmung') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await api.setExpressions(daemmungPrt[0], { name: 'thickness', value: newThickness })
        await transformLayers(tempLayers, params, api)
      }
      break
    case 'Holzlattung':
      if (holzlattungPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Holzlattung') {
            tempLayers[i] = { ...tempLayers[i], thickness: 2 * newThickness }
          }
        }
        await api.setExpressions(holzlattungPrt[0], { name: 'latchThickness', value: newThickness })
        await transformLayers(tempLayers, params, api)
      }
      break
    case 'Holzschalung':
      if (holzschalungPrt) {
        for (let i = 0; i < tempLayers.length; i++) {
          if (tempLayers[i].type === 'Holzschalung') {
            tempLayers[i] = { ...tempLayers[i], thickness: newThickness }
          }
        }
        await api.setExpressions(holzschalungPrt[0], { name: 'thickness', value: newThickness })
        await transformLayers(tempLayers, params, api)
      }
      break
    default:
      break
  }
}

async function transformLayers(layers: Layer[], params: any[], api: ApiHistory) {
  const tempLayers = [...layers]
  for (let i = 0; i < tempLayers.length; i++) {
    const posXOfLayerBefore = i - 1 >= 0 ? tempLayers[i - 1].posX : 0
    const thicknessOfLayerBefore = i - 1 >= 0 ? tempLayers[i - 1].thickness : 0
    const explodeDistance = i - 1 >= 0 ? params[di] : 0
    tempLayers[i] = {
      ...tempLayers[i],
      posX: posXOfLayerBefore + thicknessOfLayerBefore + explodeDistance,
    }
    await api.transformNode(tempLayers[i].refId, rootNode, [
      { x: tempLayers[i].posX, y: 0, z: 0 },
      xDir,
      yDir,
    ])
  }
  store.getState().setLayers(activeExampleId, -1, tempLayers)
}

///////////////////////////////////////////////////////////////

async function addLayer(layerType: string, params: any[], layers: Layer[], api: ApiHistory) {
  const tempLayers = [...layers]
  const lastLayer = tempLayers[tempLayers.length - 1]
  const layerName = layerType + tempLayers.filter(layer => layer.type === layerType).length
  switch (layerType) {
    case 'Gipsplatte':
      if (gipsplattePrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedNode = await api.addNode(gipsplattePrt[0], rootNode, transformation, layerName)
        if (addedNode) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedNode,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[gt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'Spanplatte':
      if (spanplattePrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedNode = await api.addNode(spanplattePrt[0], rootNode, transformation, layerName)
        if (addedNode) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedNode,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[spt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'Balkenwand':
      if (balkenwandAsm) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedNode = await api.addNode(balkenwandAsm[0], rootNode, transformation, layerType)
        if (addedNode) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedNode,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[bwt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
          await updateWallSize(params[wl], params[wh], params, tempLayers, api)
        }
      }
      break
    case 'Daemmung':
      if (daemmungPrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedNode = await api.addNode(daemmungPrt[0], rootNode, transformation, layerType)
        if (addedNode) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedNode,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: params[dt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'Holzlattung':
      if (holzlattungPrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedNode = await api.addNode(holzlattungPrt[0], rootNode, transformation, layerType)
        if (addedNode) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedNode,
            posX: lastLayer.posX + lastLayer.thickness + params[di],
            thickness: 2 * params[hlt],
          })
          store.getState().setLayers(activeExampleId, -1, tempLayers)
        }
      }
      break
    case 'Holzschalung':
      if (holzschalungPrt) {
        const transformation: Transform = [
          { x: lastLayer.posX + lastLayer.thickness + params[di], y: 0, z: 0 },
          xDir,
          yDir,
        ]
        const addedNode = await api.addNode(holzschalungPrt[0], rootNode, transformation, layerType)
        if (addedNode) {
          tempLayers.push({
            name: layerName,
            type: layerType,
            refId: addedNode,
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
async function explodeWall(params: any[], layers: Layer[], api: ApiHistory) {
  await transformLayers(layers, params, api)
}

//////////////////// Helpers //////////////////////////////////

async function removeNodes(nodes: number[], ownerNode: number, api: ApiHistory) {
  if (nodes.length > 0) {
    const nodesToRemove = nodes.map(nodeId => ({
      referenceId: nodeId,
      ownerId: ownerNode,
    }))
    await api.removeNodes(...nodesToRemove)
  }
}

async function createNodes(
  nof: number,
  firstPos: { x: number; y: number; z: number },
  distance: number,
  productId: number,
  ownerNode: number,
  name: string,
) {
  const nodesToAdd: node[] = []
  for (let i = 0; i < nof; i++) {
    if (productId !== null) {
      const pos = {
        x: firstPos.x,
        y: firstPos.y,
        z: firstPos.z,
      }
      nodesToAdd.push({
        productId: productId,
        ownerId: ownerNode,
        transformation: [pos, xDir, yDir],
        name: name + i,
      })
      pos.y += i * distance
    }
  }
  return nodesToAdd
}
