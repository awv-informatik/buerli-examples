/* eslint-disable max-lines */
import { FlipType, OrientationType, ReorientedType, ViewType } from '@buerli.io/classcad'
import { PointMemValue } from '@buerli.io/core'
import { ApiHistory, history, ConstraintType, Transform, DimensionType } from '@buerli.io/headless'
import templateAB from '../../resources/history/RollerTemplate.ofb'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

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
  { index: 901, name: 'saveAsOf1', type: ParamType.Button, value: saveOf1 },

  // string example
  // { index: 6, name: 'test', type: 'enum', value: 't1', values: ['t2', 't3', 't4'] },
].sort((a, b) => a.index - b.index)

// const origin = { x: 0, y: 0, z: 0 }
// const xDir = { x: 1, y: 0, z: 0 }
// const yDir = { x: 0, y: 1, z: 0 }
let zDir = { x: 0, y: 0, z: 1 }
export const minGapFrameSegment = 20
export const gapInFrame = 20
let segmentPrt: number[] | null = null

let electricPlug: [number[], number]
let pneumaticPlug: [number[], number]
let frame0: number[]
let frame1: number[]
let constrElectricPlug: ConstraintType
let constrPneumaticPlug: ConstraintType
let wcsEPlugFrame0Left: number[]
let wcsEPlugFrame0Right: number[]
let wcsPPlugFrame0Left: number[]
let wcsPPlugFrame0Right: number[]

let wcsEPlugFrame1Left: number[]
let wcsEPlugFrame1Right: number[]
let wcsPPlugFrame1Left: number[]
let wcsPPlugFrame1Right: number[]

let constrArrow0Out: ConstraintType
let constrArrow1Out: ConstraintType
let constrArrow0In: ConstraintType
let constrArrow1In: ConstraintType
let constrLogo0: ConstraintType
let constrLogo1: ConstraintType

let constrEnd1: ConstraintType
let constrEnd2: ConstraintType
let constrWalzeOrigin: ConstraintType

let currSegmentNodes: number[] = []
let currDimensions: number[] = []

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(templateAB, 'ofb')
  const rootAsm = root ? root[0] : null
  segmentPrt = await api.getPartFromContainer('Segment')

  //*************************************************/
  // Create Methoden
  //*************************************************/

  // Template
  if (rootAsm !== null) {
    constrElectricPlug = await api.getConstraint(rootAsm, 'Fastened_ElectricPlug')
    constrPneumaticPlug = await api.getConstraint(rootAsm, 'Fastened_PneumaticPlug')

    frame0 = await api.getAssemblyNode(rootAsm, 'Frame0')
    wcsEPlugFrame0Left = await api.getWorkCoordSystem(frame0[0], 'Plug_csys')
    wcsEPlugFrame0Right = await api.getWorkCoordSystem(frame0[0], 'Plug2_csys')
    wcsPPlugFrame0Left = await api.getWorkCoordSystem(frame0[0], 'Screw_csys')
    wcsPPlugFrame0Right = await api.getWorkCoordSystem(frame0[0], 'Screw2_csys')

    frame1 = await api.getAssemblyNode(rootAsm, 'Frame1')
    wcsEPlugFrame1Left = await api.getWorkCoordSystem(frame1[0], 'Plug_csys')
    wcsEPlugFrame1Right = await api.getWorkCoordSystem(frame1[0], 'Plug2_csys')
    wcsPPlugFrame1Left = await api.getWorkCoordSystem(frame1[0], 'Screw_csys')
    wcsPPlugFrame1Right = await api.getWorkCoordSystem(frame1[0], 'Screw2_csys')

    constrWalzeOrigin = await api.getConstraint(rootAsm, 'Fastened_Origin_Walze')
    constrEnd1 = await api.getConstraint(rootAsm, 'Fastened_Origin_End1')
    constrEnd2 = await api.getConstraint(rootAsm, 'Fastened_Origin_End2')

    constrArrow0Out = await api.getConstraint(rootAsm, 'Fastened_Arrow0_Out')
    constrArrow1Out = await api.getConstraint(rootAsm, 'Fastened_Arrow1_Out')
    constrArrow0In = await api.getConstraint(rootAsm, 'Fastened_Arrow0_In')
    constrArrow1In = await api.getConstraint(rootAsm, 'Fastened_Arrow1_In')
    constrLogo0 = await api.getConstraint(rootAsm, 'Fastened_Logo0')
    constrLogo1 = await api.getConstraint(rootAsm, 'Fastened_Logo1')

    await update(api, rootAsm, { lastUpdatedParam: undefined, values: params.values })
  }
  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update walze length
  if (check(paramsMap[wl])) {
    await updateWalze(params.values[wl], api)
  }

  // Update arrow directions
  if (check(paramsMap[ad]) || check(paramsMap[wl])) {
    await updateArrowDir(params.values[ad], params.values[wl], api)
  }

  // Update walze direction
  if (check(paramsMap[wd])) {
    await updateWalzeDir(api)
  }

  // Update segment size
  if (check(paramsMap[ss])) {
    await updateSegmentSize(params.values[ss], api)
  }

  // Update number of segments
  if (
    check(paramsMap[ns]) ||
    check(paramsMap[wl]) ||
    check(paramsMap[wd]) ||
    check(paramsMap[ss])
  ) {
    await updateNofSegments(
      params.values[ns],
      params.values[ss],
      params.values[wl],
      params.values[wd],
      api,
      productId,
    )
  }

  // Update plug positions
  if (check(paramsMap[pp])) {
    await updatePlugPos(params.values[pp], api)
  }
  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }

///////////////////////////////////////////////////////////////
// INTERNALS
///////////////////////////////////////////////////////////////

async function updatePlugPos(plugPos: number, api: ApiHistory) {
  switch (plugPos) {
    case 0: // frame 0 right
      electricPlug = [frame0, wcsEPlugFrame0Right[0]]
      pneumaticPlug = [frame0, wcsPPlugFrame0Right[0]]
      break
    case 1: // frame 0 left
      electricPlug = [frame0, wcsEPlugFrame0Left[0]]
      pneumaticPlug = [frame0, wcsPPlugFrame0Left[0]]
      break
    case 2: // frame 1 right
      electricPlug = [frame1, wcsEPlugFrame1Right[0]]
      pneumaticPlug = [frame1, wcsPPlugFrame1Right[0]]
      break
    case 3: // frame 1 left
      electricPlug = [frame1, wcsEPlugFrame1Left[0]]
      pneumaticPlug = [frame1, wcsPPlugFrame1Left[0]]
      break
    default:
      break
  }

  // Electric and pneumatic plug
  const fcPneumaticPlug: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrPneumaticPlug[0],
    mate1: {
      matePath: pneumaticPlug[0],
      wcsId: pneumaticPlug[1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrPneumaticPlug[2][0],
      wcsId: constrPneumaticPlug[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    xOffset: constrPneumaticPlug[3],
    yOffset: constrPneumaticPlug[4],
    zOffset: constrPneumaticPlug[5],
  }

  const fcElectricPlug: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrElectricPlug[0],
    mate1: {
      matePath: electricPlug[0],
      wcsId: electricPlug[1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrElectricPlug[2][0],
      wcsId: constrElectricPlug[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    xOffset: constrElectricPlug[3],
    yOffset: constrElectricPlug[4],
    zOffset: constrElectricPlug[5],
  }

  await api.updateFastenedConstraints(fcPneumaticPlug, fcElectricPlug)
}

///////////////////////////////////////////////////////////////

async function updateNofSegments(
  nofSegments: number,
  segSize: number,
  walzeLength: number,
  walzeDir: number,
  api: ApiHistory,
  productId: number,
) {
  const z = nofSegments > 1 ? walzeLength / 2 - minGapFrameSegment - gapInFrame - segSize / 2 : 0
  const distanceBtSegments =
    nofSegments > 1
      ? (walzeLength - 2 * (minGapFrameSegment + gapInFrame) - segSize) / (nofSegments - 1)
      : 0

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

  const nodes: {
    productId: number
    ownerId: number
    transformation: Transform
    name?: string
  }[] = []

  // If any nodes already exist, remove them
  if (currSegmentNodes.length > 0) {
    const nodesToRemove = currSegmentNodes.map(node => ({
      referenceId: node,
      ownerId: productId,
    }))
    await api.removeNodes(...nodesToRemove)
  }

  // Add segments as nodes to productId (owner/root)
  for (let i = 0; i < nofSegments; i++) {
    if (segmentPrt !== null && z !== null) {
      const firstPos = { x: 0, y: 0, z: -z }
      nodes.push({
        productId: segmentPrt[0],
        ownerId: productId,
        transformation: [firstPos, zDir, segmentDir],
        name: 'Segment' + i,
      })
      firstPos.z += i * distanceBtSegments
    }
  }
  currSegmentNodes = await api.addNodes(...nodes)
}

///////////////////////////////////////////////////////////////

async function updateSegmentSize(segSize: number, api: ApiHistory) {
  // Set length of walze in expression set
  const segment = await api.getPartFromContainer('Segment')
  await api.setExpressions(segment[0], { name: 'W', value: segSize })
}

///////////////////////////////////////////////////////////////

async function updateWalzeDir(api: ApiHistory) {
  let flipWalze = FlipType.FLIP_X_INV
  switch (constrWalzeOrigin[1][2]) {
    case 0:
      flipWalze = FlipType.FLIP_X_INV
      break
    case 1:
      flipWalze = FlipType.FLIP_X
      break
  }
  constrWalzeOrigin[1][2] = flipWalze

  await api.updateFastenedOriginConstraint(
    constrWalzeOrigin[0],
    {
      matePath: constrWalzeOrigin[1][0],
      wcsId: constrWalzeOrigin[1][1],
      flip: flipWalze,
      reoriented: constrWalzeOrigin[1][3],
    },
    constrWalzeOrigin[3],
    constrWalzeOrigin[4],
    constrWalzeOrigin[5],
  )
}

///////////////////////////////////////////////////////////////

async function updateArrowDir(arrowDir: number, walzeLength: number, api: ApiHistory) {
  let reorientArrow0In = ReorientedType.REORIENTED_0
  let reorientArrow0Out = ReorientedType.REORIENTED_0
  let reorientArrow1In = ReorientedType.REORIENTED_0
  let reorientArrow1Out = ReorientedType.REORIENTED_0
  let reorientLogo0 = ReorientedType.REORIENTED_0
  let reorientLogo1 = ReorientedType.REORIENTED_0
  let reorientEnd1 = ReorientedType.REORIENTED_0
  let reorientEnd2 = ReorientedType.REORIENTED_0

  switch (arrowDir) {
    case 0: // up
      reorientArrow0In = ReorientedType.REORIENTED_0
      reorientArrow0Out = ReorientedType.REORIENTED_0
      reorientArrow1In = ReorientedType.REORIENTED_0
      reorientArrow1Out = ReorientedType.REORIENTED_0
      reorientLogo0 = ReorientedType.REORIENTED_0
      reorientLogo1 = ReorientedType.REORIENTED_0
      reorientEnd1 = ReorientedType.REORIENTED_0
      reorientEnd2 = ReorientedType.REORIENTED_180
      break
    case 1: // left
      reorientArrow0In = ReorientedType.REORIENTED_90
      reorientArrow0Out = ReorientedType.REORIENTED_270
      reorientArrow1In = ReorientedType.REORIENTED_270
      reorientArrow1Out = ReorientedType.REORIENTED_90
      reorientLogo0 = ReorientedType.REORIENTED_270
      reorientLogo1 = ReorientedType.REORIENTED_90
      reorientEnd1 = ReorientedType.REORIENTED_270
      reorientEnd2 = ReorientedType.REORIENTED_90
      break
    case 2: // down
      reorientArrow0In = ReorientedType.REORIENTED_180
      reorientArrow0Out = ReorientedType.REORIENTED_180
      reorientArrow1In = ReorientedType.REORIENTED_180
      reorientArrow1Out = ReorientedType.REORIENTED_180
      reorientLogo0 = ReorientedType.REORIENTED_180
      reorientLogo1 = ReorientedType.REORIENTED_180
      reorientEnd1 = ReorientedType.REORIENTED_180
      reorientEnd2 = ReorientedType.REORIENTED_0
      break
    case 3: // right
      reorientArrow0In = ReorientedType.REORIENTED_270
      reorientArrow0Out = ReorientedType.REORIENTED_90
      reorientArrow1In = ReorientedType.REORIENTED_90
      reorientArrow1Out = ReorientedType.REORIENTED_270
      reorientLogo0 = ReorientedType.REORIENTED_90
      reorientLogo1 = ReorientedType.REORIENTED_270
      reorientEnd1 = ReorientedType.REORIENTED_90
      reorientEnd2 = ReorientedType.REORIENTED_270
      break
    default:
      break
  }

  // Arrows
  const fcArrow0Out: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrArrow0Out[0],
    mate1: {
      matePath: constrArrow0Out[1][0],
      wcsId: constrArrow0Out[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrArrow0Out[2][0],
      wcsId: constrArrow0Out[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientArrow0Out,
    },
    xOffset: constrArrow0Out[3],
    yOffset: constrArrow0Out[4],
    zOffset: constrArrow0Out[5],
  }

  const fcArrow1Out: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrArrow1Out[0],
    mate1: {
      matePath: constrArrow1Out[1][0],
      wcsId: constrArrow1Out[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrArrow1Out[2][0],
      wcsId: constrArrow1Out[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientArrow1Out,
    },
    xOffset: constrArrow1Out[3],
    yOffset: constrArrow1Out[4],
    zOffset: constrArrow1Out[5],
  }

  const fcArrow0In: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrArrow0In[0],
    mate1: {
      matePath: constrArrow0In[1][0],
      wcsId: constrArrow0In[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrArrow0In[2][0],
      wcsId: constrArrow0In[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientArrow0In,
    },
    xOffset: constrArrow0In[3],
    yOffset: constrArrow0In[4],
    zOffset: constrArrow0In[5],
  }

  const fcArrow1In: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrArrow1In[0],
    mate1: {
      matePath: constrArrow1In[1][0],
      wcsId: constrArrow1In[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrArrow1In[2][0],
      wcsId: constrArrow1In[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientArrow1In,
    },
    xOffset: constrArrow1In[3],
    yOffset: constrArrow1In[4],
    zOffset: constrArrow1In[5],
  }

  // Logos
  const fcLogo0: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrLogo0[0],
    mate1: {
      matePath: constrLogo0[1][0],
      wcsId: constrLogo0[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrLogo0[2][0],
      wcsId: constrLogo0[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientLogo0,
    },
    xOffset: constrLogo0[3],
    yOffset: constrLogo0[4],
    zOffset: constrLogo0[5],
  }

  const fcLogo1: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    mate2: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrLogo1[0],
    mate1: {
      matePath: constrLogo1[1][0],
      wcsId: constrLogo1[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    mate2: {
      matePath: constrLogo1[2][0],
      wcsId: constrLogo1[2][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientLogo1,
    },
    xOffset: constrLogo1[3],
    yOffset: constrLogo1[4],
    zOffset: constrLogo1[5],
  }

  await api.updateFastenedConstraints(
    fcArrow0Out,
    fcArrow1Out,
    fcArrow0In,
    fcArrow1In,
    fcLogo0,
    fcLogo1,
  )

  // Frames (End)
  const focEnd1: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrEnd1[0],
    mate1: {
      matePath: constrEnd1[1][0],
      wcsId: constrEnd1[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: reorientEnd1,
    },
    xOffset: 0,
    yOffset: 0,
    zOffset: -walzeLength / 2,
  }

  const focEnd2: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrEnd2[0],
    mate1: {
      matePath: constrEnd2[1][0],
      wcsId: constrEnd2[1][1],
      flip: FlipType.FLIP_Z_INV,
      reoriented: reorientEnd2,
    },
    xOffset: 0,
    yOffset: 0,
    zOffset: walzeLength / 2,
  }

  await api.updateFastenedOriginConstraints(focEnd1, focEnd2)
}

///////////////////////////////////////////////////////////////

async function updateWalze(walzeLength: number, api: ApiHistory) {
  // Set length of walze in expression set
  const walze = await api.getPartFromContainer('Walze')
  await api.setExpressions(walze[0], { name: 'L', value: walzeLength })

  // Set offset in z-Dir for frame0
  const focEnd1: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrEnd1[0],
    mate1: {
      matePath: constrEnd1[1][0],
      wcsId: constrEnd1[1][1],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    xOffset: 0,
    yOffset: 0,
    zOffset: -walzeLength / 2,
  }

  // Set offset in z-Dir for frame1
  const focEnd2: {
    constrId: number
    mate1: { matePath: number[]; wcsId: number; flip: number; reoriented: number }
    xOffset: number
    yOffset: number
    zOffset: number
  } = {
    constrId: constrEnd2[0],
    mate1: {
      matePath: constrEnd2[1][0],
      wcsId: constrEnd2[1][1],
      flip: FlipType.FLIP_Z_INV,
      reoriented: ReorientedType.REORIENTED_180,
    },
    xOffset: 0,
    yOffset: 0,
    zOffset: walzeLength / 2,
  }

  await api.updateFastenedOriginConstraints(focEnd1, focEnd2)
}

///////////////////////////////////////////////////////////////

async function prepareViews(api: ApiHistory) {
  const activeExample = storeApi.getState().activeExample
  const params = storeApi.getState().examples.objs[activeExample].params
  const productId = await api.getCurrentProduct()

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
  let dimStartPos: PointMemValue = { x: 0, y: 0, z: 0 }
  let dimEndPos: PointMemValue = { x: 0, y: 0, z: 0 }
  let dimTextPos: PointMemValue = { x: 0, y: 0, z: 0 }
  let dimTextAngle: number = 0
  let dimOrientation: OrientationType = OrientationType.HORIZONTAL
  const dimensions: DimensionType[] = []

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
      dimOrientation = OrientationType.VERTICAL
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
      dimOrientation = OrientationType.VERTICAL
      break
    default:
      break
  }

  const frameWidth_D: DimensionType = {
    productId: productId,
    dimParam: {
      dimType: 'LinearDimension',
      dimLabel: 'Endstuecklaenge = ',
      dimStartPos: dimStartPos,
      dimEndPos: dimEndPos,
      dimTextPos: dimTextPos,
      dimTextAngle: dimTextAngle,
      dimOrientation: dimOrientation,
    },
    dxfView: ViewType.TOP,
  }
  dimensions.push(frameWidth_D)

  // Segment width
  let segmentDiameter_D: DimensionType
  if (params.values[ns] > 0) {
    z =
      params.values[ns] > 1
        ? -params.values[wl] / 2 + minGapFrameSegment + gapInFrame + params.values[ss] / 2
        : 0
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
        dimOrientation = OrientationType.VERTICAL
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
        dimOrientation = OrientationType.VERTICAL
        break
      default:
        break
    }

    segmentDiameter_D = {
      productId: productId,
      dimParam: {
        dimType: 'LinearDimension',
        dimLabel: 'Segmentdurchmesser = ',
        dimStartPos: dimStartPos,
        dimEndPos: dimEndPos,
        dimTextPos: dimTextPos,
        dimTextAngle: dimTextAngle,
        dimOrientation: dimOrientation,
      },
      dxfView: ViewType.TOP,
    }
    dimensions.push(segmentDiameter_D)
  }

  // Segment width
  let segmentWidth_SDR: DimensionType
  if (params.values[ns] > 0) {
    dimStartPos = { x: 0, y: -(segmentDiameter / 2), z: z + params.values[ss] / 2 }
    dimEndPos = { x: 0, y: -(segmentDiameter / 2), z: z - params.values[ss] / 2 }
    dimTextPos = { x: 0, y: -textOffsetSegmentWidth, z: z }

    segmentWidth_SDR = {
      productId: productId,
      dimParam: {
        dimType: 'LinearDimension',
        dimLabel: 'Segmentbreite = ',
        dimStartPos: dimStartPos,
        dimEndPos: dimEndPos,
        dimTextPos: dimTextPos,
        dimTextAngle: 0,
        dimOrientation: OrientationType.HORIZONTAL,
      },
      dxfView: ViewType.RIGHT_90,
    }
    dimensions.push(segmentWidth_SDR)
  }

  // Walze length
  dimStartPos = { x: 0, y: 0, z: params.values[wl] / 2 }
  dimEndPos = { x: 0, y: 0, z: -(params.values[wl] / 2) }
  dimTextPos = { x: 0, y: textOffsetWalzenLength, z: 0 }

  const walzeLength_SDR: DimensionType = {
    productId: productId,
    dimParam: {
      dimType: 'LinearDimension',
      dimLabel: 'Walzenlaenge = ',
      dimStartPos: dimStartPos,
      dimEndPos: dimEndPos,
      dimTextPos: dimTextPos,
      dimTextAngle: 0,
      dimOrientation: OrientationType.HORIZONTAL,
    },
    dxfView: ViewType.RIGHT_90,
  }
  dimensions.push(walzeLength_SDR)

  // Frame depth
  z = -(params.values[wl] / 2) - 40 + frameDepth / 2
  dimStartPos = { x: 0, y: 0, z: z + frameDepth / 2 }
  dimEndPos = { x: 0, y: 0, z: z - frameDepth / 2 }
  dimTextPos = { x: 0, y: -textOffsetFrameDepth, z: z }

  const frameDepth_SDR: DimensionType = {
    productId: productId,
    dimParam: {
      dimType: 'LinearDimension',
      dimLabel: 'Endstuecktiefe = ',
      dimStartPos: dimStartPos,
      dimEndPos: dimEndPos,
      dimTextPos: dimTextPos,
      dimTextAngle: 0,
      dimOrientation: OrientationType.HORIZONTAL,
    },
    dxfView: ViewType.RIGHT_90,
  }
  dimensions.push(frameDepth_SDR)

  // If any dimensions already exist, remove them
  if (currDimensions.length > 0) {
    await api.removeDimensions(currDimensions)
  }
  currDimensions = await api.addDimensions(...dimensions)

  await api.create2DViews(productId, [ViewType.TOP, ViewType.RIGHT_90, ViewType.ISO])
  await api.place2DViews(productId, [
    { viewType: ViewType.ISO, vector: { x: params.values[wl], y: params.values[wl], z: 0 } },
    { viewType: ViewType.RIGHT_90, vector: { x: params.values[wl], y: 0, z: 0 } },
  ])
  return productId
}

///////////////////////////////////////////////////////////////
/**
 * Export DXF is not available in the free version, please contact AWV Informatik for more information
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function exportDXF(api: ApiHistory) {
  const productId = await prepareViews(api)
  const data = await api.exportDXF(productId)
  if (data) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.dxf`
    link.click()
  }
}

///////////////////////////////////////////////////////////////
/**
 * Export SVG is not available in the free version, please contact AWV Informatik for more information
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function exportSVG(api: ApiHistory) {
  const productId = await prepareViews(api)
  const data = await api.exportSVG(productId)
  if (data) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.svg`
    link.click()
  }
}

///////////////////////////////////////////////////////////////

async function saveOf1(api: ApiHistory) {
  const data = await api.save('ofb')
  if (data) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
    link.download = `RollerAssembly.of1`
    link.click()
  }
}
