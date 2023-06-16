import {
  FlipType,
  ReorientedType,
  BooleanOperationType,
  WorkCoordSystemType,
} from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  /* consts */
  const pt0 = { x: 0, y: 0, z: 0 }
  const pt1 = { x: 50, y: 0, z: 0 }
  const pt2 = { x: 100, y: 0, z: 0 }
  const pt3 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }
  const nullPos = { x: 0, y: 0, z: 0 }
  const nullRot = { x: 0, y: 0, z: 0 }

  /* root assembly */
  const lBracketAsm = await api.createRootAssembly('L_Bracket_Assembly')

  /* nut part */
  const wcsNut = {
    boxPos: nullPos,
    boxRot: nullRot,
    cylPos: { x: 15, y: 15, z: 0 },
    cylRot: nullRot,
    mate1Pos: { x: 15, y: 15, z: 0 },
    mate1Rot: nullRot,
  }
  const nut = await api.createPartAsTemplate('Nut')
  const wcsBoxNut = await api.createWorkCoordSystem(
    nut,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsNut.boxPos,
    wcsNut.boxRot,
    false,
    'wcsBoxNut',
  )
  const wcsCylNut = await api.createWorkCoordSystem(
    nut,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsNut.cylPos,
    wcsNut.cylRot,
    false,
    'wcsCylNut',
  )
  const mate1Nut = await api.createWorkCoordSystem(
    nut,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsNut.mate1Pos,
    wcsNut.mate1Rot,
    false,
    'mate1Nut',
  )
  const boxNut = api.box(nut, [wcsBoxNut], 30, 30, 10)
  const cylNut = api.cylinder(nut, [wcsCylNut], 20, 40)
  api.boolean(nut, BooleanOperationType.SUBTRACTION, [boxNut, cylNut])

  /* bolt part */
  const wcsBolt = {
    shaftPos: { x: 0, y: 0, z: 0 },
    shaftRot: nullRot,
    headPos: { x: 0, y: 0, z: -10 },
    headRot: nullRot,
    mate1Pos: nullPos,
    mate1Rot: nullRot,
  }
  const bolt = await api.createPartAsTemplate('Bolt')
  const wcsShaftBolt = await api.createWorkCoordSystem(
    bolt,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsBolt.shaftPos,
    wcsBolt.shaftRot,
    false,
    'wcsShaftBolt',
  )
  const wcsHeadBolt = await api.createWorkCoordSystem(
    bolt,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsBolt.headPos,
    wcsBolt.headRot,
    false,
    'wcsHeadBolt',
  )
  const mate1Bolt = await api.createWorkCoordSystem(
    bolt,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsBolt.mate1Pos,
    wcsBolt.mate1Rot,
    false,
    'mate1Bolt',
  )
  const shaft = api.cylinder(bolt, [wcsShaftBolt], 20, 60)
  const head = api.cylinder(bolt, [wcsHeadBolt], 30, 10)
  api.boolean(bolt, BooleanOperationType.UNION, [shaft, head])

  /* lbracket part */
  const wcsLBracket = {
    basePos: nullPos,
    baseRot: nullRot,
    subPos: { x: 20, y: 0, z: 20 },
    subRot: nullRot,
    mate1Pos: { x: 75, y: 50, z: 0 },
    mate1Rot: nullRot,
    mate2Pos: { x: 45, y: 100, z: 0 },
    mate2Rot: nullRot,
    mate3Pos: { x: 75, y: 150, z: 0 },
    mate3Rot: nullRot,
  }
  const lBracket = await api.createPartAsTemplate('L_Bracket')
  const wcsBaseBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsLBracket.basePos,
    wcsLBracket.baseRot,
    false,
    'wcsBaseBracket',
  )
  const wcsSubBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsLBracket.subPos,
    wcsLBracket.subRot,
    false,
    'wcsSubBracket',
  )
  const baseBracket = api.box(lBracket, [wcsBaseBracket], 200, 100, 100)
  const subBracket = api.box(lBracket, [wcsSubBracket], 200, 100, 100)
  const mate1LBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsLBracket.mate1Pos,
    wcsLBracket.mate1Rot,
    false,
    'mate1LBracket',
  )
  const mate2LBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsLBracket.mate2Pos,
    wcsLBracket.mate2Rot,
    false,
    'mate2LBracket',
  )
  const mate3LBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    wcsLBracket.mate3Pos,
    wcsLBracket.mate3Rot,
    false,
    'mate3LBracket',
  )
  const sub1Bracket = api.cylinder(lBracket, [mate1LBracket], 20, 40)
  const sub2Bracket = api.cylinder(lBracket, [mate2LBracket], 20, 40)
  const sub3Bracket = api.cylinder(lBracket, [mate3LBracket], 20, 40)
  api.boolean(lBracket, BooleanOperationType.SUBTRACTION, [
    baseBracket,
    subBracket,
    sub1Bracket,
    sub2Bracket,
    sub3Bracket,
  ])

  /* nut-bolt assembly */
  const nutBoltAsm = await api.createAssemblyAsTemplate('Nut_Bolt_Assembly')
  const [nutRef, boltRef] = await api.addNodes(
    {
      productId: nut,
      ownerId: nutBoltAsm,
      transformation: [pt0, xDir, yDir],
    },
    {
      productId: bolt,
      ownerId: nutBoltAsm,
      transformation: [pt0, xDir, yDir],
    },
  )

  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    {
      matePath: [boltRef],
      wcsId: mate1Bolt,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC1',
  )

  await api.createFastenedConstraint(
    nutBoltAsm,
    {
      matePath: [nutRef],
      wcsId: mate1Nut,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [boltRef],
      wcsId: mate1Bolt,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    -20,
    'FC1',
  )

  /* l-bracket assembly */
  const [nutBoltRef0, nutBoltRef1, nutBoltRef2, lBracketRef] = await api.addNodes(
    {
      productId: nutBoltAsm,
      ownerId: lBracketAsm,
      transformation: [pt0, xDir, yDir],
    },
    {
      productId: nutBoltAsm,
      ownerId: lBracketAsm,
      transformation: [pt1, xDir, yDir],
    },
    {
      productId: nutBoltAsm,
      ownerId: lBracketAsm,
      transformation: [pt2, xDir, yDir],
    },
    {
      productId: lBracket,
      ownerId: lBracketAsm,
      transformation: [pt3, xDir, yDir],
    },
  )
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef],
      wcsId: mate1LBracket,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    20,
    'FOC2',
  )

  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef],
      wcsId: mate1LBracket,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltRef0],
      wcsId: wcsShaftBolt,
      flip: FlipType.FLIP_Z_INV,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    20,

    'FC2',
  )
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef],
      wcsId: mate2LBracket,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltRef1],
      wcsId: wcsShaftBolt,
      flip: FlipType.FLIP_Z_INV,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    20,
    'FC3',
  )
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef],
      wcsId: mate3LBracket,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltRef2],
      wcsId: wcsShaftBolt,
      flip: FlipType.FLIP_Z_INV,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    20,
    'FC4',
  )
  return lBracketAsm
}

export const cad = new history()

export default { create, paramsMap, cad }
