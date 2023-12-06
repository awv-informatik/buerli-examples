import { CCClasses, OrientationType, ViewType } from '@buerli.io/classcad'
import { ApiHistory, DimensionType, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/Flange/FlangePrt.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

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
  { index: 901, name: 'createDimensions', type: ParamType.Button, value: createDimensions },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const productId = await api.load(arraybuffer, 'ofb')

  // Set initial values
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  await api.setExpressions({
    partId: productId[0],
    members: [
      { name: 'holeCount', value: holesCount },
      { name: 'flangeHeight', value: flangeHeight },
    ],
  })
  return productId[0]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  api.setExpressions({
    partId: productId,
    members: [
      { name: 'holeCount', value: holesCount },
      { name: 'flangeHeight', value: flangeHeight },
    ],
  })
  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }

async function createDimensions(api: ApiHistory) {
  const activeExample = storeApi.getState().activeExample
  const params = storeApi.getState().examples.objs[activeExample].params
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]
  const productId = await api.getCurrentProduct()
  const dimensions: DimensionType[] = []

  if (productId === null) {
    console.warn('No product found')
    return null
  }

  // *** Diameter of the base plate with the holes
  const diameterLD: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCLinearDimension,
      name: 'Diameter1',
      label: 'Diameter = ',
      startPos: { x: 0, y: 155, z: 0 },
      endPos: { x: 0, y: -155, z: 0 },
      textPos: { x: -200, y: 0, z: 0 },
      orientation: OrientationType.ALIGNED,
    },
    dxfView: ViewType.TOP,
  }
  dimensions.push(diameterLD)

  // *** Angle between the first hole (90° / 0 o'clock / y-Axis dir) and the second one in clockwise direction
  const angleBetweenHolesInRad = 2 * Math.PI / holesCount // 360° / holes Count
  const angleFromZeroInRad = (Math.PI / 2) - angleBetweenHolesInRad
  const xEndPos = Math.cos(angleFromZeroInRad) * 125  // 125 = radius holes
  const yEndPos = Math.sin(angleFromZeroInRad) * 125  // 125 = radius holes
  const xPosText = Math.cos(angleFromZeroInRad + (angleBetweenHolesInRad / 2)) * 300  // 300 = radius text
  const yPosText = Math.sin(angleFromZeroInRad + (angleBetweenHolesInRad / 2)) * 300  // 300 = radius text
  const angle_cw: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCAngularDimension,
      name: 'Angle',
      label: 'Angle = ',
      value: '<> deg', // <> = placeholder for value
      startPos: { x: 0, y: 125, z: 30 },
      endPos: { x: xEndPos, y: yEndPos, z: 30 },
      cornerPos: { x: 0, y: 0, z: 30 },
      textPos: { x: xPosText, y: yPosText, z: 30 },
      isCCW: false,
    },
    dxfView: ViewType.TOP,
  }
  dimensions.push(angle_cw)
  
  // *** Radius of the upper cylinder
  const upperCylRadius: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCRadialDimension,
      name: 'Radius',
      label: 'Radius = ',
      centerPos: { x: 0, y: 0, z: flangeHeight },
      textPos: { x: -100, y: -100, z: flangeHeight },
      radius: 95,
    },
    dxfView: ViewType.TOP,
  }
  dimensions.push(upperCylRadius)

  // *** Diameter of the hole closest to 270° (6 o'clock)
  const holeIndex = Math.floor(holesCount / 2)  // The middle one or the one before
  const angleFrom270InRad = Math.PI - (holeIndex * angleBetweenHolesInRad)  // delta angle from 270°
  const xHoleCenter = Math.sin(angleFrom270InRad) * 125 // x Pos of the hole center
  const yHoleCenter = Math.cos(angleFrom270InRad) * 125 // y Pos of the hole center
  console.info(holeIndex)
  const holeDiameter: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCLinearDimension,
      name: 'Durchmesser2',
      label: 'Durchmesser = ',
      startPos: { x: xHoleCenter -15, y: -yHoleCenter, z: 30 }, // left side of the hole
      endPos: { x: xHoleCenter + 15, y: -yHoleCenter, z: 30 },  // right side of the hole
      textPos: { x: 0, y: -200, z: 30 },
      orientation: OrientationType.HORIZONTAL,
    },
    dxfView: ViewType.TOP,
  }
  dimensions.push(holeDiameter)

  // *** Thickness of the base plate with the holes
  const thicknessDim: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCLinearDimension,
      name: 'Thickness',
      label: 'Thickness = ',
      startPos: { x: 155, y: 0, z: 30 },
      endPos: { x: 155, y: 0, z: 0 },
      textPos: { x: 200, y: 0, z: 70 },
      orientation: OrientationType.VERTICAL,
    },
    dxfView: ViewType.LEFT,
  }
  dimensions.push(thicknessDim)

  // *** Diameter of the upper cylinder
  const upperCylDiameter: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCLinearDimension,
      name: 'DiameterDM',
      label: '', 
      value: 'DM <>',
      startPos: { x: 0, y: 95, z: flangeHeight },
      endPos: { x: 0, y: -95, z: flangeHeight },
      textPos: { x: 0, y: 0, z: flangeHeight + 50 },
      orientation: OrientationType.HORIZONTAL,
    },
    dxfView: ViewType.RIGHT,
  }
  dimensions.push(upperCylDiameter)

  // *** Height of the entire flange, equal to "Flange Height" parameter
  const upperCylHeight: DimensionType = {
    productId,
    param: {
      type: CCClasses.CCLinearDimension,
      name: 'Height',
      label: 'Height = ',
      startPos: { x: 0, y: 95, z: 0 },
      endPos: { x: 0, y: 95, z: flangeHeight },
      textPos: { x: 0, y: 200, z: 70 },
      orientation: OrientationType.HORIZONTAL,
    },
    dxfView: ViewType.RIGHT_90,
  }
  dimensions.push(upperCylHeight)

  await api.addDimensions(...dimensions)
  await api.create2DViews(productId, [ViewType.TOP, ViewType.RIGHT, ViewType.RIGHT_90, ViewType.ISO])
  await api.place2DViews(productId, [
    { viewType: ViewType.ISO, vector: { x: 500, y: 500, z: 0 } },
    { viewType: ViewType.RIGHT, vector: { x: 500, y: 0, z: 0 } },
    { viewType: ViewType.RIGHT_90, vector: { x: 1000, y: 0, z: 0 } },
  ])

  return productId
}
