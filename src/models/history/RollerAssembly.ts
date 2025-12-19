/* eslint-disable max-lines */
import { BuerliCadFacade } from '@buerli.io/classcad'
import { getDrawing, ObjectID } from '@buerli.io/core'
import templateAB from '../../resources/history/RollerTemplate.ofb?buffer'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

type point = { x: number; y: number; z: number } | [number, number, number]

type Transform = [point, point, point]

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

type FastenedConstraint = {
  id: number
  name: string
  mate1: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  mate2: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  xOffset: number
  yOffset: number
  zOffset: number
  xRotation: number
  yRotation: number
  zRotation: number
}

type FastenedOriginConstraint = {
  id: number
  name: string
  mate1: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  xOffset: number
  yOffset: number
  zOffset: number
  xRotation: number
  yRotation: number
  zRotation: number
}

type FlipType = 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
type ReorientType = '0' | '90' | '180' | '270'

const wl = 0
const ad = 1
const wd = 2
const ss = 3
const ns = 4
const pp = 5

export const paramsMap: Param[] = [
  { index: wl, name: 'walzeLength', type: ParamType.Number, value: 800 },
  { index: ad, name: 'arrowDirection', type: ParamType.Enum, value: 0, values: [0, 1, 2, 3] },
  { index: wd, name: 'walzeDirection', type: ParamType.Enum, value: 0, values: [0, 1] },
  { index: ss, name: 'segmentSize', type: ParamType.Number, value: 50 },
  { index: ns, name: 'nofSegments', type: ParamType.Number, value: 0 },
  { index: pp, name: 'plugPosition', type: ParamType.Enum, value: 0, values: [0, 1, 2, 3] },
  { index: 901, name: 'saveAsOfb', type: ParamType.Button, value: saveOfb },
  { index: 902, name: 'saveAsDxf', type: ParamType.Button, value: exportDXF },
  { index: 903, name: 'saveAsSvg', type: ParamType.Button, value: exportSVG },

  // string example
  // { index: 6, name: 'test', type: 'enum', value: 't1', values: ['t2', 't3', 't4'] },
].sort((a, b) => a.index - b.index)

// const origin = { x: 0, y: 0, z: 0 }
// const xDir = { x: 1, y: 0, z: 0 }
// const yDir = { x: 0, y: 1, z: 0 }
let zDir = { x: 0, y: 0, z: 1 }
export const minGapFrameSegment = 20
export const gapInFrame = 20
let segmentPrt: number | null = null

let electricPlug: { path: ObjectID[]; csys: ObjectID }
let pneumaticPlug: { path: ObjectID[]; csys: ObjectID }
let frame0: ObjectID
let frame1: ObjectID
let constrElectricPlug: FastenedConstraint
let constrPneumaticPlug: FastenedConstraint
let wcsEPlugFrame0Left: ObjectID
let wcsEPlugFrame0Right: ObjectID
let wcsPPlugFrame0Left: ObjectID
let wcsPPlugFrame0Right: ObjectID

let wcsEPlugFrame1Left: ObjectID
let wcsEPlugFrame1Right: ObjectID
let wcsPPlugFrame1Left: ObjectID
let wcsPPlugFrame1Right: ObjectID

let constrArrow0Out: FastenedConstraint
let constrArrow1Out: FastenedConstraint
let constrArrow0In: FastenedConstraint
let constrArrow1In: FastenedConstraint
let constrLogo0: FastenedConstraint
let constrLogo1: FastenedConstraint

let constrEnd1: FastenedOriginConstraint
let constrEnd2: FastenedOriginConstraint
let constrWalzeOrigin: FastenedOriginConstraint

let currSegmentInstances: number[] = []
let currDimensions: number[] = []

const data = templateAB

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, common: commonApi, part: partApi } = model.api.v1

  // The global module variables might be set from a previous run --> reset them
  zDir = { x: 0, y: 0, z: 1 }
  segmentPrt = null
  electricPlug = undefined
  pneumaticPlug = undefined
  frame0 = undefined
  frame1 = undefined
  constrElectricPlug = undefined
  constrPneumaticPlug = undefined
  wcsEPlugFrame0Left = undefined
  wcsEPlugFrame0Right = undefined
  wcsPPlugFrame0Left = undefined
  wcsPPlugFrame0Right = undefined
  wcsEPlugFrame1Left = undefined
  wcsEPlugFrame1Right = undefined
  wcsPPlugFrame1Left = undefined
  wcsPPlugFrame1Right = undefined
  constrArrow0Out = undefined
  constrArrow1Out = undefined
  constrArrow0In = undefined
  constrArrow1In = undefined
  constrLogo0 = undefined
  constrLogo1 = undefined
  constrEnd1 = undefined
  constrEnd2 = undefined
  constrWalzeOrigin = undefined
  currSegmentInstances = []
  currDimensions = []

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const { id: rootAsm } = await commonApi.load({ data, format: 'OFB' })
  segmentPrt = (await assemblyApi.getPartTemplate({ name: 'Segment' })) as number

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Template
  if (rootAsm !== null) {
    constrElectricPlug = (await assemblyApi.getFastened({
      id: rootAsm,
      name: 'Fastened_ElectricPlug',
    })) as FastenedConstraint
    constrPneumaticPlug = (await assemblyApi.getFastened({
      id: rootAsm,
      name: 'Fastened_PneumaticPlug',
    })) as FastenedConstraint

    frame0 = (await assemblyApi.getInstance({ ownerId: rootAsm, name: 'Frame0' })) as number

    wcsEPlugFrame0Left = (await partApi.getWorkGeometry({ id: frame0, name: 'Plug_csys' })) as number
    wcsEPlugFrame0Right = (await partApi.getWorkGeometry({ id: frame0, name: 'Plug2_csys' })) as number
    wcsPPlugFrame0Left = (await partApi.getWorkGeometry({ id: frame0, name: 'Screw_csys' })) as number
    wcsPPlugFrame0Right = (await partApi.getWorkGeometry({ id: frame0, name: 'Screw2_csys' })) as number

    frame1 = (await assemblyApi.getInstance({ ownerId: rootAsm, name: 'Frame1' })) as number
    wcsEPlugFrame1Left = (await partApi.getWorkGeometry({ id: frame1, name: 'Plug_csys' })) as number
    wcsEPlugFrame1Right = (await partApi.getWorkGeometry({ id: frame1, name: 'Plug2_csys' })) as number
    wcsPPlugFrame1Left = (await partApi.getWorkGeometry({ id: frame1, name: 'Screw_csys' })) as number
    wcsPPlugFrame1Right = (await partApi.getWorkGeometry({ id: frame1, name: 'Screw2_csys' })) as number

    constrWalzeOrigin = (await assemblyApi.getFastenedOrigin({
      id: rootAsm,
      name: 'Fastened_Origin_Walze',
    })) as FastenedOriginConstraint
    constrEnd1 = (await assemblyApi.getFastenedOrigin({
      id: rootAsm,
      name: 'Fastened_Origin_End1',
    })) as FastenedOriginConstraint
    constrEnd2 = (await assemblyApi.getFastenedOrigin({
      id: rootAsm,
      name: 'Fastened_Origin_End2',
    })) as FastenedOriginConstraint

    constrArrow0Out = (await assemblyApi.getFastened({
      id: rootAsm,
      name: 'Fastened_Arrow0_Out',
    })) as FastenedConstraint
    constrArrow1Out = (await assemblyApi.getFastened({
      id: rootAsm,
      name: 'Fastened_Arrow1_Out',
    })) as FastenedConstraint
    constrArrow0In = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Arrow0_In' })) as FastenedConstraint
    constrArrow1In = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Arrow1_In' })) as FastenedConstraint
    constrLogo0 = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Logo0' })) as FastenedConstraint
    constrLogo1 = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Logo1' })) as FastenedConstraint

    await update(model, rootAsm, { lastUpdatedParam: undefined, values: params.values })
  }
  return rootAsm
}

export const update: Update = async (model, productId, params) => {
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update walze length
  if (check(paramsMap[wl])) {
    await updateWalze(params.values[wl], model)
  }

  // Update arrow directions
  if (check(paramsMap[ad]) || check(paramsMap[wl])) {
    await updateArrowDir(params.values[ad], params.values[wl], model)
  }

  // Update walze direction
  if (check(paramsMap[wd])) {
    await updateWalzeDir(model)
  }

  // Update segment size
  if (check(paramsMap[ss])) {
    await updateSegmentSize(params.values[ss], model)
  }

  // Update number of segments
  if (check(paramsMap[ns]) || check(paramsMap[wl]) || check(paramsMap[wd]) || check(paramsMap[ss])) {
    await updateNofSegments(
      params.values[ns],
      params.values[ss],
      params.values[wl],
      params.values[wd],
      model,
      productId,
    )
  }

  // Update plug positions
  if (check(paramsMap[pp])) {
    await updatePlugPos(params.values[pp], model)
  }
  return productId
}

export default { create, update, paramsMap }

///////////////////////////////////////////////////////////////
// INTERNALS
///////////////////////////////////////////////////////////////

async function updatePlugPos(plugPos: number, model: BuerliCadFacade) {
  switch (plugPos) {
    case 0: // frame 0 right
      electricPlug = { path: [frame0], csys: wcsEPlugFrame0Right }
      pneumaticPlug = { path: [frame0], csys: wcsPPlugFrame0Right }
      break
    case 1: // frame 0 left
      electricPlug = { path: [frame0], csys: wcsEPlugFrame0Left }
      pneumaticPlug = { path: [frame0], csys: wcsPPlugFrame0Left }
      break
    case 2: // frame 1 right
      electricPlug = { path: [frame1], csys: wcsEPlugFrame1Right }
      pneumaticPlug = { path: [frame1], csys: wcsPPlugFrame1Right }
      break
    case 3: // frame 1 left
      electricPlug = { path: [frame1], csys: wcsEPlugFrame1Left }
      pneumaticPlug = { path: [frame1], csys: wcsPPlugFrame1Left }
      break
    default:
      break
  }

  // Electric and pneumatic plug
  const fcPneumaticPlug: FastenedConstraint = {
    ...constrPneumaticPlug,
    mate1: {
      ...constrPneumaticPlug.mate1,
      path: pneumaticPlug.path,
      csys: pneumaticPlug.csys,
    },
  }

  const fcElectricPlug: FastenedConstraint = {
    ...constrElectricPlug,
    mate1: {
      ...constrElectricPlug.mate1,
      path: electricPlug.path,
      csys: electricPlug.csys,
    },
  }

  await model.api.assembly.updateFastened([fcPneumaticPlug, fcElectricPlug])
}

///////////////////////////////////////////////////////////////

async function updateNofSegments(
  nofSegments: number,
  segSize: number,
  walzeLength: number,
  walzeDir: number,
  model: BuerliCadFacade,
  productId: number,
) {
  const z = nofSegments > 1 ? walzeLength / 2 - minGapFrameSegment - gapInFrame - segSize / 2 : 0
  const distanceBtSegments =
    nofSegments > 1 ? (walzeLength - 2 * (minGapFrameSegment + gapInFrame) - segSize) / (nofSegments - 1) : 0

  const segmentDir = { x: 0, y: 1, z: 0 }

  //walzedir = 0 -> zDir   1 ->-zdir ---
  switch (
    walzeDir //fliptype of Walzeconstraint
  ) {
    case 0:
      //segmentDir = { x: 0, y: 1, z: 0 }
      zDir = { x: 0, y: 0, z: -1 }
      break
    case 1:
      //segmentDir = { x: 0, y: 1, z: 0 }
      zDir = { x: 0, y: 0, z: 1 }
      break
    default:
      break
  }

  const instances: {
    productId: number
    ownerId: number
    transformation: Transform
    name?: string
  }[] = []

  // If any instances already exist, remove them
  if (currSegmentInstances.length > 0) {
    await model.api.assembly.deleteInstance({ ids: currSegmentInstances })
  }

  // Add segments as instances to productId (owner/root)
  for (let i = 0; i < nofSegments; i++) {
    if (segmentPrt !== null && z !== null) {
      const firstPos = { x: 0, y: 0, z: -z }
      instances.push({
        productId: segmentPrt,
        ownerId: productId,
        transformation: [firstPos, zDir, segmentDir],
        name: 'Segment' + i,
      })
      firstPos.z += i * distanceBtSegments
    }
  }
  currSegmentInstances = (await model.api.assembly.instance(instances)) as number[]
}

///////////////////////////////////////////////////////////////

async function updateSegmentSize(segSize: number, model: BuerliCadFacade) {
  // Set length of walze in expression set
  const segment = await model.api.assembly.getPartTemplate({ name: 'Segment' })
  await model.api.part.updateExpression({ id: segment as number, toUpdate: [{ name: 'W', value: segSize }] })
}

///////////////////////////////////////////////////////////////

async function updateWalzeDir(model: BuerliCadFacade) {
  let flipWalze: FlipType = '-X'
  switch (constrWalzeOrigin.mate1.flip) {
    case 'X':
      flipWalze = '-X'
      break
    case '-X':
      flipWalze = 'X'
      break
  }
  constrWalzeOrigin.mate1.flip = flipWalze
  await model.api.assembly.updateFastenedOrigin(constrWalzeOrigin)
}

///////////////////////////////////////////////////////////////

async function updateArrowDir(arrowDir: number, walzeLength: number, model: BuerliCadFacade) {
  let reorientArrow0In: ReorientType = '0'
  let reorientArrow0Out: ReorientType = '0'
  let reorientArrow1In: ReorientType = '0'
  let reorientArrow1Out: ReorientType = '0'
  let reorientLogo0: ReorientType = '0'
  let reorientLogo1: ReorientType = '0'
  let reorientEnd1: ReorientType = '0'
  let reorientEnd2: ReorientType = '0'

  switch (arrowDir) {
    case 0: // up
      reorientArrow0In = '0'
      reorientArrow0Out = '0'
      reorientArrow1In = '0'
      reorientArrow1Out = '0'
      reorientLogo0 = '0'
      reorientLogo1 = '0'
      reorientEnd1 = '0'
      reorientEnd2 = '180'
      break
    case 1: // left
      reorientArrow0In = '90'
      reorientArrow0Out = '270'
      reorientArrow1In = '270'
      reorientArrow1Out = '90'
      reorientLogo0 = '270'
      reorientLogo1 = '90'
      reorientEnd1 = '270'
      reorientEnd2 = '90'
      break
    case 2: // down
      reorientArrow0In = '180'
      reorientArrow0Out = '180'
      reorientArrow1In = '180'
      reorientArrow1Out = '180'
      reorientLogo0 = '180'
      reorientLogo1 = '180'
      reorientEnd1 = '180'
      reorientEnd2 = '0'
      break
    case 3: // right
      reorientArrow0In = '270'
      reorientArrow0Out = '90'
      reorientArrow1In = '90'
      reorientArrow1Out = '270'
      reorientLogo0 = '90'
      reorientLogo1 = '270'
      reorientEnd1 = '90'
      reorientEnd2 = '270'
      break
    default:
      break
  }

  // Arrows
  const fcArrow0Out: FastenedConstraint = {
    ...constrArrow0Out,
    mate2: {
      ...constrArrow0Out.mate2,
      reorient: reorientArrow0Out,
    },
  }

  const fcArrow1Out: FastenedConstraint = {
    ...constrArrow1Out,
    mate2: {
      ...constrArrow1Out.mate2,
      reorient: reorientArrow1Out,
    },
  }

  const fcArrow0In: FastenedConstraint = {
    ...constrArrow0In,
    mate2: {
      ...constrArrow0In.mate2,
      reorient: reorientArrow0In,
    },
  }

  const fcArrow1In: FastenedConstraint = {
    ...constrArrow1In,
    mate2: {
      ...constrArrow1In.mate2,
      reorient: reorientArrow1In,
    },
  }

  // Logos
  const fcLogo0: FastenedConstraint = {
    ...constrLogo0,
    mate2: {
      ...constrLogo0.mate2,
      reorient: reorientLogo0,
    },
  }

  const fcLogo1: FastenedConstraint = {
    ...constrLogo1,
    mate2: {
      ...constrLogo1.mate2,
      reorient: reorientLogo1,
    },
  }

  await model.api.assembly.updateFastened([fcArrow0Out, fcArrow1Out, fcArrow0In, fcArrow1In, fcLogo0, fcLogo1])

  // Frames (End)
  const focEnd1: FastenedOriginConstraint = {
    ...constrEnd1,
    mate1: {
      ...constrEnd1.mate1,
      reorient: reorientEnd1,
    },
    zOffset: -walzeLength / 2,
  }

  const focEnd2: FastenedOriginConstraint = {
    ...constrEnd2,
    mate1: {
      ...constrEnd2.mate1,
      reorient: reorientEnd2,
    },
    zOffset: walzeLength / 2,
  }

  await model.api.assembly.updateFastenedOrigin([focEnd1, focEnd2])
}

///////////////////////////////////////////////////////////////

async function updateWalze(walzeLength: number, model: BuerliCadFacade) {
  // Set length of walze in expression set
  const walze = (await model.api.assembly.getPartTemplate({ name: 'Walze' })) as number
  await model.api.part.updateExpression({ id: walze as number, toUpdate: [{ name: 'L', value: walzeLength }] })

  // Set offset in z-Dir for frame0
  const focEnd1: FastenedOriginConstraint = {
    ...constrEnd1,
    zOffset: -walzeLength / 2,
  }

  // Set offset in z-Dir for frame1
  const focEnd2: FastenedOriginConstraint = {
    ...constrEnd2,
    zOffset: walzeLength / 2,
  }

  await model.api.assembly.updateFastenedOrigin([focEnd1, focEnd2])
}

///////////////////////////////////////////////////////////////

async function prepareViews(model: BuerliCadFacade) {
  const activeExample = storeApi.getState().activeExample
  const params = storeApi.getState().examples.objs[activeExample].params
  const productId = getDrawing(model.drawingId).structure.currentProduct

  if (productId === null) {
    console.warn('No product found')
    return null
  }

  // Some consts
  const frameDepth = 60
  const frameWidth = 210
  const segmentDiameter = 150
  const textOffsetFrameWidth = 40
  const textOffsetSegmentDiameter = 100
  const textOffsetWalzenLength = 150
  const textOffsetFrameDepth = 150
  const textOffsetSegmentWidth = 180
  let dimStartPos = { x: 0, y: 0, z: 0 }
  let dimEndPos = { x: 0, y: 0, z: 0 }
  let dimTextPos = { x: 0, y: 0, z: 0 }
  let dimTextAngle: number = 0
  let dimOrientation: 'HORIZONTAL' | 'VERTICAL' = 'HORIZONTAL'
  const dimensions: LinearDimension[] = []

  // Frame width
  let z = params.values[wl] / 2 + 40 - frameDepth / 2
  switch (params.values[ad]) {
    case 0:
      dimStartPos = { x: -(frameWidth / 2), y: -90, z: z }
      dimEndPos = { x: frameWidth / 2, y: -90, z: z }
      dimTextPos = { x: 0, y: -90 - textOffsetFrameWidth, z: z }
      break
    case 1:
      dimStartPos = { x: 90, y: -(frameWidth / 2), z: z }
      dimEndPos = { x: 90, y: frameWidth / 2, z: z }
      dimTextPos = { x: 90 + textOffsetFrameWidth, y: 0, z: z }
      dimTextAngle = Math.PI / 2
      dimOrientation = 'VERTICAL'
      break
    case 2:
      dimStartPos = { x: -(frameWidth / 2), y: 90, z: z }
      dimEndPos = { x: frameWidth / 2, y: 90, z: z }
      dimTextPos = { x: 0, y: 90 + textOffsetFrameWidth, z: z }
      break
    case 3:
      dimStartPos = { x: -90, y: -(frameWidth / 2), z: z }
      dimEndPos = { x: -90, y: frameWidth / 2, z: z }
      dimTextPos = { x: -90 - textOffsetFrameWidth, y: 0, z: z }
      dimTextAngle = Math.PI / 2
      dimOrientation = 'VERTICAL'
      break
    default:
      break
  }

  const frameWidth_D: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      label: 'Endstuecklaenge = ',
      textPos: dimTextPos,
    },
    linear: {
      startPos: dimStartPos,
      endPos: dimEndPos,
      textAngle: dimTextAngle,
      orientation: dimOrientation,
    },
    viewType: 'TOP',
  }
  dimensions.push(frameWidth_D)

  // Segment width
  let segmentDiameter_D: LinearDimension
  if (params.values[ns] > 0) {
    z = params.values[ns] > 1 ? -params.values[wl] / 2 + minGapFrameSegment + gapInFrame + params.values[ss] / 2 : 0
    switch (params.values[ad]) {
      case 0:
        dimStartPos = { x: -(segmentDiameter / 2), y: 0, z: z }
        dimEndPos = { x: segmentDiameter / 2, y: 0, z: z }
        dimTextPos = { x: 0, y: textOffsetSegmentDiameter, z: z }
        break
      case 1:
        dimStartPos = { x: 0, y: -(segmentDiameter / 2), z: z }
        dimEndPos = { x: 0, y: segmentDiameter / 2, z: z }
        dimTextPos = { x: -textOffsetSegmentDiameter, y: 0, z: z }
        dimTextAngle = Math.PI / 2
        dimOrientation = 'VERTICAL'
        break
      case 2:
        dimStartPos = { x: -(segmentDiameter / 2), y: 0, z: z }
        dimEndPos = { x: segmentDiameter / 2, y: 0, z: z }
        dimTextPos = { x: 0, y: -textOffsetSegmentDiameter, z: z }
        break
      case 3:
        dimStartPos = { x: 0, y: -(segmentDiameter / 2), z: z }
        dimEndPos = { x: 0, y: segmentDiameter / 2, z: z }
        dimTextPos = { x: textOffsetSegmentDiameter, y: 0, z: z }
        dimTextAngle = Math.PI / 2
        dimOrientation = 'VERTICAL'
        break
      default:
        break
    }

    segmentDiameter_D = {
      id: productId,
      common: {
        type: 'LINEAR',
        label: 'Segmentdurchmesser = ',
        textPos: dimTextPos,
      },
      linear: {
        startPos: dimStartPos,
        endPos: dimEndPos,
        textAngle: dimTextAngle,
        orientation: dimOrientation,
      },
      viewType: 'TOP',
    }
    dimensions.push(segmentDiameter_D)
  }

  // Segment width
  let segmentWidth_SDR: LinearDimension
  if (params.values[ns] > 0) {
    dimStartPos = { x: 0, y: -(segmentDiameter / 2), z: z + params.values[ss] / 2 }
    dimEndPos = { x: 0, y: -(segmentDiameter / 2), z: z - params.values[ss] / 2 }
    dimTextPos = { x: 0, y: -textOffsetSegmentWidth, z: z }

    segmentWidth_SDR = {
      id: productId,
      common: {
        type: 'LINEAR',
        label: 'Segmentbreite = ',
        textPos: dimTextPos,
      },
      linear: {
        startPos: dimStartPos,
        endPos: dimEndPos,
        orientation: 'HORIZONTAL',
      },
      viewType: 'RIGHT_90',
    }
    dimensions.push(segmentWidth_SDR)
  }

  // Walze length
  dimStartPos = { x: 0, y: 0, z: params.values[wl] / 2 }
  dimEndPos = { x: 0, y: 0, z: -(params.values[wl] / 2) }
  dimTextPos = { x: 0, y: textOffsetWalzenLength, z: 0 }

  const walzeLength_SDR: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      label: 'Walzenlaenge = ',
      textPos: dimTextPos,
    },
    linear: {
      startPos: dimStartPos,
      endPos: dimEndPos,
      orientation: 'HORIZONTAL',
    },
    viewType: 'RIGHT_90',
  }
  dimensions.push(walzeLength_SDR)

  // Frame depth
  z = -(params.values[wl] / 2) - 40 + frameDepth / 2
  dimStartPos = { x: 0, y: 0, z: z + frameDepth / 2 }
  dimEndPos = { x: 0, y: 0, z: z - frameDepth / 2 }
  dimTextPos = { x: 0, y: -textOffsetFrameDepth, z: z }

  const frameDepth_SDR: LinearDimension = {
    id: productId,
    common: {
      type: 'LINEAR',
      label: 'Endstuecktiefe = ',
      textPos: dimTextPos,
    },
    linear: {
      startPos: dimStartPos,
      endPos: dimEndPos,
      orientation: 'HORIZONTAL',
    },
    viewType: 'RIGHT_90',
  }
  dimensions.push(frameDepth_SDR)

  // If any dimensions already exist, remove them
  if (currDimensions.length > 0) {
    await model.api.drawing2d.deleteDimension({ ids: currDimensions })
  }
  currDimensions = (await model.api.drawing2d.dimension(dimensions)) as number[]

  await model.api.drawing2d.view({ id: productId, types: ['TOP', 'RIGHT_90', 'ISO'] })
  await model.api.drawing2d.placeView({
    id: productId,
    placements: [
      { type: 'ISO', offset: { x: params.values[wl], y: params.values[wl], z: 0 } },
      { type: 'RIGHT_90', offset: { x: params.values[wl], y: 0, z: 0 } },
    ],
  })
  return productId
}

///////////////////////////////////////////////////////////////
/**
 * Export DXF is not available for WASM and arm64 systems
 */
async function exportDXF(model: BuerliCadFacade) {
  const isDXFAvailable = await model.api.drawing2d.isDXFAvailable()
  if (isDXFAvailable) {
    const productId = await prepareViews(model)
    const dxfData = await model.api.drawing2d.exportDXF({ id: productId })
    if (dxfData?.content) {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([dxfData.content], { type: 'application/octet-stream' }))
      link.download = `RollerAssembly.dxf`
      link.click()
    }
  } else {
    console.error('Export DXF not supported by the used ClassCAD build.')
    alert('Export DXF not supported by the used ClassCAD build.')
  }
}

///////////////////////////////////////////////////////////////
/**
 * Export SVG is not available for WASM and arm64 systems
 */
async function exportSVG(model: BuerliCadFacade) {
  const isSVGAvailable = await model.api.drawing2d.isSVGAvailable()
  if (isSVGAvailable) {
    const productId = await prepareViews(model)
    const svgData = await model.api.drawing2d.exportSVG({ id: productId })
    if (svgData?.content) {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([svgData.content], { type: 'application/octet-stream' }))
      link.download = `RollerAssembly.svg`
      link.click()
    }
  } else {
    console.error('Export SVG not supported by the used ClassCAD build.')
    alert('Export SVG not supported by the used ClassCAD build.')
  }
}

///////////////////////////////////////////////////////////////

async function saveOfb(model: BuerliCadFacade) {
  const ofbData = await model.api.v1.common.save({ format: 'OFB' })
  if (ofbData) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([ofbData.content], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.ofb`
    link.click()
  }
}
