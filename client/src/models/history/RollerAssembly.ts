/* eslint-disable max-lines */
import { getDrawing, ObjectID } from '@buerli.io/core'
import { History, Transform } from '@buerli.io/headless'
import { Buffer } from 'buffer'
import { CadModel } from '../../CadModel'
import templateAB from '../../resources/history/RollerTemplate.ofb?buffer'
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
    textAngle: number
    orientation: 'VERTICAL' | 'HORIZONTAL' | 'ALIGNED'
  }
}

type FastenedConstraint = {
  id: number
  name: string
  mate1: {
    matePath: number[]
    wcsId: number
    flipType: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorientType: '0' | '90' | '180' | '270'
  }
  mate2: {
    matePath: number[]
    wcsId: number
    flipType: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorientType: '0' | '90' | '180' | '270'
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
    matePath: number[]
    wcsId: number
    flipType: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorientType: '0' | '90' | '180' | '270'
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

let electricPlug: { matePath: ObjectID[]; wcsId: ObjectID }
let pneumaticPlug: { matePath: ObjectID[]; wcsId: ObjectID }
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

const data = Buffer.from(templateAB).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, basemodeler: baseModelerApi, part: partApi } = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const {
    result: { id: rootAsm },
  } = await baseModelerApi.load({ data, format: 'ofb', encoding: 'base64' })
  segmentPrt = (await assemblyApi.getPartTemplate({ name: 'Segment' })).result as number

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Template
  if (rootAsm !== null) {
    constrElectricPlug = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_ElectricPlug' }))
      .result as FastenedConstraint
    constrPneumaticPlug = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_PneumaticPlug' }))
      .result as FastenedConstraint

    frame0 = (await assemblyApi.getInstance({ ownerId: rootAsm, name: 'Frame0' })).result as number

    wcsEPlugFrame0Left = (await partApi.getWorkGeometry({ id: frame0, name: 'Plug_csys' })).result as number
    wcsEPlugFrame0Right = (await partApi.getWorkGeometry({ id: frame0, name: 'Plug2_csys' })).result as number
    wcsPPlugFrame0Left = (await partApi.getWorkGeometry({ id: frame0, name: 'Screw_csys' })).result as number
    wcsPPlugFrame0Right = (await partApi.getWorkGeometry({ id: frame0, name: 'Screw2_csys' })).result as number

    frame1 = (await assemblyApi.getInstance({ ownerId: rootAsm, name: 'Frame1' })).result as number
    wcsEPlugFrame1Left = (await partApi.getWorkGeometry({ id: frame1, name: 'Plug_csys' })).result as number
    wcsEPlugFrame1Right = (await partApi.getWorkGeometry({ id: frame1, name: 'Plug2_csys' })).result as number
    wcsPPlugFrame1Left = (await partApi.getWorkGeometry({ id: frame1, name: 'Screw_csys' })).result as number
    wcsPPlugFrame1Right = (await partApi.getWorkGeometry({ id: frame1, name: 'Screw2_csys' })).result as number

    constrWalzeOrigin = (await assemblyApi.getFastenedOrigin({ id: rootAsm, name: 'Fastened_Origin_Walze' }))
      .result as FastenedOriginConstraint
    constrEnd1 = (await assemblyApi.getFastenedOrigin({ id: rootAsm, name: 'Fastened_Origin_End1' }))
      .result as FastenedOriginConstraint
    constrEnd2 = (await assemblyApi.getFastenedOrigin({ id: rootAsm, name: 'Fastened_Origin_End2' }))
      .result as FastenedOriginConstraint

    constrArrow0Out = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Arrow0_Out' }))
      .result as FastenedConstraint
    constrArrow1Out = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Arrow1_Out' }))
      .result as FastenedConstraint
    constrArrow0In = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Arrow0_In' }))
      .result as FastenedConstraint
    constrArrow1In = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Arrow1_In' }))
      .result as FastenedConstraint
    constrLogo0 = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Logo0' })).result as FastenedConstraint
    constrLogo1 = (await assemblyApi.getFastened({ id: rootAsm, name: 'Fastened_Logo1' })).result as FastenedConstraint

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

export const cad = new History()

export default { create, update, paramsMap, cad }

///////////////////////////////////////////////////////////////
// INTERNALS
///////////////////////////////////////////////////////////////

async function updatePlugPos(plugPos: number, model: CadModel) {
  switch (plugPos) {
    case 0: // frame 0 right
      electricPlug = { matePath: [frame0], wcsId: wcsEPlugFrame0Right }
      pneumaticPlug = { matePath: [frame0], wcsId: wcsPPlugFrame0Right }
      break
    case 1: // frame 0 left
      electricPlug = { matePath: [frame0], wcsId: wcsEPlugFrame0Left }
      pneumaticPlug = { matePath: [frame0], wcsId: wcsPPlugFrame0Left }
      break
    case 2: // frame 1 right
      electricPlug = { matePath: [frame1], wcsId: wcsEPlugFrame1Right }
      pneumaticPlug = { matePath: [frame1], wcsId: wcsPPlugFrame1Right }
      break
    case 3: // frame 1 left
      electricPlug = { matePath: [frame1], wcsId: wcsEPlugFrame1Left }
      pneumaticPlug = { matePath: [frame1], wcsId: wcsPPlugFrame1Left }
      break
    default:
      break
  }

  // Electric and pneumatic plug
  const fcPneumaticPlug: FastenedConstraint = {
    ...constrPneumaticPlug,
    mate1: {
      ...constrPneumaticPlug.mate1,
      matePath: pneumaticPlug.matePath,
      wcsId: pneumaticPlug.wcsId,
    },
  }

  const fcElectricPlug: FastenedConstraint = {
    ...constrElectricPlug,
    mate1: {
      ...constrElectricPlug.mate1,
      matePath: electricPlug.matePath,
      wcsId: electricPlug.wcsId,
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
  model: CadModel,
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
        productId: segmentPrt[0],
        ownerId: productId,
        transformation: [firstPos, zDir, segmentDir],
        name: 'Segment' + i,
      })
      firstPos.z += i * distanceBtSegments
    }
  }
  currSegmentInstances = (await model.api.assembly.instance(instances)).result as number[]
}

///////////////////////////////////////////////////////////////

async function updateSegmentSize(segSize: number, model: CadModel) {
  // Set length of walze in expression set
  const { result: segment } = await model.api.assembly.getPartTemplate({ name: 'Segment' })
  await model.api.part.updateExpression({ id: segment as number, toUpdate: [{ name: 'W', value: segSize }] })
}

///////////////////////////////////////////////////////////////

async function updateWalzeDir(model: CadModel) {
  let flipWalze: FlipType = '-X'
  switch (constrWalzeOrigin.mate1.flipType) {
    case 'X':
      flipWalze = '-X'
      break
    case '-X':
      flipWalze = 'X'
      break
  }
  await model.api.assembly.updateFastenedOrigin({
    ...constrWalzeOrigin,
    mate1: { ...constrWalzeOrigin.mate1, flipType: flipWalze },
  })
}

///////////////////////////////////////////////////////////////

async function updateArrowDir(arrowDir: number, walzeLength: number, model: CadModel) {
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
      reorientType: reorientArrow0Out,
    },
  }

  const fcArrow1Out: FastenedConstraint = {
    ...constrArrow1Out,
    mate2: {
      ...constrArrow1Out.mate2,
      reorientType: reorientArrow1Out,
    },
  }

  const fcArrow0In: FastenedConstraint = {
    ...constrArrow0In,
    mate2: {
      ...constrArrow0In.mate2,
      reorientType: reorientArrow0In,
    },
  }

  const fcArrow1In: FastenedConstraint = {
    ...constrArrow1In,
    mate2: {
      ...constrArrow1In.mate2,
      reorientType: reorientArrow1In,
    },
  }

  // Logos
  const fcLogo0: FastenedConstraint = {
    ...constrLogo0,
    mate2: {
      ...constrLogo0.mate2,
      reorientType: reorientLogo0,
    },
  }

  const fcLogo1: FastenedConstraint = {
    ...constrLogo1,
    mate2: {
      ...constrLogo1.mate2,
      reorientType: reorientLogo1,
    },
  }

  await model.api.assembly.updateFastened([fcArrow0Out, fcArrow1Out, fcArrow0In, fcArrow1In, fcLogo0, fcLogo1])

  // Frames (End)
  const focEnd1: FastenedOriginConstraint = {
    ...constrEnd1,
    mate1: {
      ...constrEnd1.mate1,
      reorientType: reorientEnd1,
    },
    zOffset: -walzeLength / 2,
  }

  const focEnd2: FastenedOriginConstraint = {
    ...constrEnd2,
    mate1: {
      ...constrEnd2.mate1,
      reorientType: reorientEnd2,
    },
    zOffset: walzeLength / 2,
  }

  await model.api.assembly.updateFastenedOrigin([focEnd1, focEnd2])
}

///////////////////////////////////////////////////////////////

async function updateWalze(walzeLength: number, model: CadModel) {
  // Set length of walze in expression set
  const walze = (await model.api.assembly.getPartTemplate({ name: 'Walze' })).result as number
  await model.api.part.updateExpression({ id: walze[0], toUpdate: [{ name: 'L', value: walzeLength }] })

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

async function prepareViews(model: CadModel) {
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
        textAngle: 0,
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
      textAngle: 0,
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
      textAngle: 0,
      orientation: 'HORIZONTAL',
    },
    viewType: 'RIGHT_90',
  }
  dimensions.push(frameDepth_SDR)

  // If any dimensions already exist, remove them
  if (currDimensions.length > 0) {
    await model.api.drawing2d.deleteDimension({ ids: currDimensions })
  }
  currDimensions = (await model.api.drawing2d.dimension(dimensions)).result as number[]

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
 * Export DXF is not available for arm64 systems
 */
async function exportDXF(model: CadModel) {
  const productId = await prepareViews(model)
  const { result: dxfData } = await model.api.drawing2d.exportDXF({ id: productId })
  if (dxfData?.content) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([dxfData.content], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.dxf`
    link.click()
  }
}

///////////////////////////////////////////////////////////////
/**
 * Export SVG is not available for arm64 systems
 */
async function exportSVG(model: CadModel) {
  const productId = await prepareViews(model)
  const { result: svgData } = await model.api.drawing2d.exportSVG({ id: productId })
  if (svgData?.content) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([svgData.content], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.svg`
    link.click()
  }
}

///////////////////////////////////////////////////////////////

async function saveOfb(model: CadModel) {
  const { result: ofbData } = await model.api.basemodeler.save({ format: 'ofb' })
  if (ofbData) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([ofbData.content], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.ofb`
    link.click()
  }
}
