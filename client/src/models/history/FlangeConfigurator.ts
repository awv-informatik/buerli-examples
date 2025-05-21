import { getDrawing } from '@buerli.io/core'
import { Buffer } from 'buffer'
import { CadModel } from '../../CadModel'
import arraybuffer from '../../resources/history/Flange/FlangePrt.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type point = { x: number; y: number; z: number } | [number, number, number]

type LinearDimension = {
  id: string | number | number
  viewType: 'TOP' | 'FRONT' | 'RIGHT' | 'LEFT' | 'BOTTOM' | 'RIGHT_90' | 'LEFT_90' | 'BACK' | 'ISO'
  common: {
    type: 'LINEAR' | 'ANGULAR' | 'RADIAL' | 'DIAMETER'
    name?: string
    label?: string
    value?: string | number
    color?: number
    layer?: string
    textPos: point
  }
  linear?: {
    startPos: point
    endPos: point
    textAngle?: number
    orientation: 'VERTICAL' | 'HORIZONTAL' | 'ALIGNED'
  }
}

type RadialDimension = {
  id: string | number | number
  viewType: 'TOP' | 'FRONT' | 'RIGHT' | 'LEFT' | 'BOTTOM' | 'RIGHT_90' | 'LEFT_90' | 'BACK' | 'ISO'
  common: {
    type: 'LINEAR' | 'ANGULAR' | 'RADIAL' | 'DIAMETER'
    name?: string
    label?: string
    value?: string | number
    color?: number
    layer?: string
    textPos: point
  }
  radial?: {
    centerPos: point
    radius: number
  }
}

type AngularDimension = {
  id: string | number | number
  viewType: 'TOP' | 'FRONT' | 'RIGHT' | 'LEFT' | 'BOTTOM' | 'RIGHT_90' | 'LEFT_90' | 'BACK' | 'ISO'
  common: {
    type: 'LINEAR' | 'ANGULAR' | 'RADIAL' | 'DIAMETER'
    name?: string
    label?: string
    value?: string | number
    color?: number
    layer?: string
    textPos: point
  }
  angular?: {
    startPos: point
    endPos: point
    cornerPos: point
    isCCW?: boolean
  }
}

export const paramsMap: Param[] = [
  { index: 0, name: 'Holes Count', type: ParamType.Slider, value: 6, step: 1, values: [2, 12] },
  {
    index: 1,
    name: 'Flange Height',
    type: ParamType.Slider,
    value: 100,
    step: 5,
    values: [40, 300],
  },
  { index: 901, name: 'saveAsOfb', type: ParamType.Button, value: saveOfb },
  { index: 902, name: 'saveAsDxf', type: ParamType.Button, value: exportDXF },
  { index: 903, name: 'saveAsSvg', type: ParamType.Button, value: exportSVG },
].sort((a, b) => a.index - b.index)

let currDimensions: number[] = []

const data = Buffer.from(arraybuffer).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { part: partApi, common: commonApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const {
    result: { id: productId },
  } = await commonApi.load({ data, format: 'ofb', encoding: 'base64' })

  // Set initial values
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  await partApi.updateExpression({
    id: productId,
    toUpdate: [
      { name: 'holeCount', value: holesCount },
      { name: 'flangeHeight', value: flangeHeight },
    ],
  })
  await createDimensions(model, productId)
  return productId
}

export const update: Update = async (model, productId, params) => {
  const { part: partApi } = model.api.v1

  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  await partApi.updateExpression({
    id: productId,
    toUpdate: [
      { name: 'holeCount', value: holesCount },
      { name: 'flangeHeight', value: flangeHeight },
    ],
  })
  await createDimensions(model, productId)
  return productId
}

export default { create, update, paramsMap }

async function createDimensions(model: CadModel, productId: number) {
  const { drawing2d: drawingApi } = model.api.v1

  const activeExample = storeApi.getState().activeExample
  const params = storeApi.getState().examples.objs[activeExample].params
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]
  const dimensions = []

  if (productId === null) {
    console.warn('No product found')
    return null
  }

  // *** Diameter of the base plate with the holes
  const diameterLD: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      name: 'Diameter1',
      label: 'Diameter = ',
      textPos: { x: -200, y: 0, z: 0 },
    },
    linear: {
      startPos: { x: 0, y: 155, z: 0 },
      endPos: { x: 0, y: -155, z: 0 },
      orientation: 'ALIGNED',
    },
    viewType: 'TOP',
  }
  dimensions.push(diameterLD)

  // *** Angle between the first hole (90° / 0 o'clock / y-Axis dir) and the second one in clockwise direction
  const angleBetweenHolesInRad = (2 * Math.PI) / holesCount // 360° / holes Count
  const angleFromZeroInRad = Math.PI / 2 - angleBetweenHolesInRad
  const xEndPos = Math.cos(angleFromZeroInRad) * 125 // 125 = radius holes
  const yEndPos = Math.sin(angleFromZeroInRad) * 125 // 125 = radius holes
  const xPosText = Math.cos(angleFromZeroInRad + angleBetweenHolesInRad / 2) * 300 // 300 = radius text
  const yPosText = Math.sin(angleFromZeroInRad + angleBetweenHolesInRad / 2) * 300 // 300 = radius text
  const angle_cw: AngularDimension = {
    id: productId,
    common: {
      type: 'ANGULAR',
      name: 'Angle',
      label: 'Angle = ',
      value: '<>', // <> = placeholder for value
      textPos: { x: xPosText, y: yPosText, z: 30 },
    },
    angular: {
      startPos: { x: 0, y: 125, z: 30 },
      endPos: { x: xEndPos, y: yEndPos, z: 30 },
      cornerPos: { x: 0, y: 0, z: 30 },
      isCCW: false,
    },
    viewType: 'TOP',
  }
  dimensions.push(angle_cw)

  // *** Radius of the upper cylinder
  const upperCylRadius: RadialDimension = {
    id: productId,
    common: {
      type: 'RADIAL',
      name: 'Radius',
      label: 'Radius = ',
      textPos: { x: -100, y: -100, z: flangeHeight },
    },
    radial: {
      centerPos: { x: 0, y: 0, z: flangeHeight },
      radius: 95,
    },
    viewType: 'TOP',
  }
  dimensions.push(upperCylRadius)

  // *** Diameter of the hole closest to 270° (6 o'clock)
  const holeIndex = Math.floor(holesCount / 2) // The middle one or the one before
  const angleFrom270InRad = Math.PI - holeIndex * angleBetweenHolesInRad // delta angle from 270°
  const xHoleCenter = Math.sin(angleFrom270InRad) * 125 // x Pos of the hole center
  const yHoleCenter = Math.cos(angleFrom270InRad) * 125 // y Pos of the hole center
  const holeDiameter: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      name: 'Durchmesser2',
      label: 'Durchmesser = ',
      textPos: { x: 0, y: -200, z: 30 },
    },
    linear: {
      startPos: { x: xHoleCenter - 15, y: -yHoleCenter, z: 30 }, // left side of the hole
      endPos: { x: xHoleCenter + 15, y: -yHoleCenter, z: 30 }, // right side of the hole
      orientation: 'HORIZONTAL',
    },
    viewType: 'TOP',
  }
  dimensions.push(holeDiameter)

  // *** Thickness of the base plate with the holes
  const thicknessDim: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      name: 'Thickness',
      label: 'Thickness = ',
      textPos: { x: 0, y: -250, z: 70 },
    },
    linear: {
      startPos: { x: 0, y: -155, z: 0 },
      endPos: { x: 0, y: -155, z: 30 },
      orientation: 'VERTICAL',
    },
    viewType: 'RIGHT',
  }
  dimensions.push(thicknessDim)

  // *** Diameter of the upper cylinder
  const upperCylDiameter: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      name: 'DiameterDM',
      label: '',
      value: 'DM <>',
      textPos: { x: 0, y: 0, z: flangeHeight + 50 },
    },
    linear: {
      startPos: { x: 0, y: 95, z: flangeHeight },
      endPos: { x: 0, y: -95, z: flangeHeight },
      orientation: 'HORIZONTAL',
    },
    viewType: 'RIGHT',
  }
  dimensions.push(upperCylDiameter)

  // *** Height of the entire flange, equal to "Flange Height" parameter
  const upperCylHeight: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      name: 'Height',
      label: 'Height = ',
      textPos: { x: 0, y: 200, z: 70 },
    },
    linear: {
      startPos: { x: 0, y: 95, z: 0 },
      endPos: { x: 0, y: 95, z: flangeHeight },
      orientation: 'HORIZONTAL',
    },
    viewType: 'RIGHT_90',
  }
  dimensions.push(upperCylHeight)

  // If any dimensions already exist, remove them
  if (currDimensions.length > 0) {
    await drawingApi.deleteDimension({ ids: currDimensions })
  }
  const res = await drawingApi.dimension(dimensions)
  currDimensions = res.result as number[]

  await drawingApi.view({ id: productId, types: ['TOP', 'RIGHT', 'RIGHT_90', 'ISO'] })
  await drawingApi.placeView({
    id: productId,
    placements: [
      { type: 'ISO', offset: { x: 500, y: 500, z: 0 } },
      { type: 'RIGHT', offset: { x: 500, y: 0, z: 0 } },
      { type: 'RIGHT_90', offset: { x: 1000, y: 0, z: 0 } },
    ],
  })
  return productId
}

///////////////////////////////////////////////////////////////
/**
 * Export DXF is not available for arm64 systems
 */
async function exportDXF(model: CadModel) {
  const { drawing2d: drawingApi } = model.api.v1
  const productId = getDrawing(model.drawingId).structure.currentProduct
  const { result: dxfData } = await drawingApi.exportDXF({ id: productId })
  if (dxfData?.content) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([dxfData.content], { type: 'application/octet-stream' }))
    link.download = `Flange.dxf`
    link.click()
  }
}

///////////////////////////////////////////////////////////////
/**
 * Export SVG is not available for arm64 systems
 */
async function exportSVG(model: CadModel) {
  const { drawing2d: drawingApi } = model.api.v1
  const productId = getDrawing(model.drawingId).structure.currentProduct
  const { result: svgData } = await drawingApi.exportSVG({ id: productId })
  if (svgData?.content) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([svgData.content], { type: 'application/octet-stream' }))
    link.download = `Flange.svg`
    link.click()
  }
}

///////////////////////////////////////////////////////////////

async function saveOfb(model: CadModel) {
  const { common: commonApi } = model.api.v1
  const {
    result: { content: ofbData },
  } = await commonApi.save({ format: 'ofb' })
  if (ofbData) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([ofbData], { type: 'application/octet-stream' }))
    link.download = `Flange.ofb`
    link.click()
  }
}
