import { FlipType, ReorientedType, BooleanOperationType, WorkCoordSystemType } from '@buerli.io/classcad'
import { ApiHistory } from '@buerli.io/headless'
import { ParamType } from '../../store'

export const create = async (api: ApiHistory, params?: ParamType) => {
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
    [],
    wcsNut.boxPos,
    wcsNut.boxRot,
    0,
    false,
    'wcsBoxNut',
  )
  const wcsCylNut = await api.createWorkCoordSystem(
    nut,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsNut.cylPos,
    wcsNut.cylRot,
    0,
    false,
    'wcsCylNut',
  )
  const mate1Nut = await api.createWorkCoordSystem(
    nut,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsNut.mate1Pos,
    wcsNut.mate1Rot,
    0,
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
    [],
    wcsBolt.shaftPos,
    wcsBolt.shaftRot,
    0,
    false,
    'wcsShaftBolt',
  )
  const wcsHeadBolt = await api.createWorkCoordSystem(
    bolt,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsBolt.headPos,
    wcsBolt.headRot,
    0,
    false,
    'wcsHeadBolt',
  )
  const mate1Bolt = await api.createWorkCoordSystem(
    bolt,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsBolt.mate1Pos,
    wcsBolt.mate1Rot,
    0,
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
    [],
    wcsLBracket.basePos,
    wcsLBracket.baseRot,
    0,
    false,
    'wcsBaseBracket',
  )
  const wcsSubBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsLBracket.subPos,
    wcsLBracket.subRot,
    0,
    false,
    'wcsSubBracket',
  )
  const baseBracket = api.box(lBracket, [wcsBaseBracket], 200, 100, 100)
  const subBracket = api.box(lBracket, [wcsSubBracket], 200, 100, 100)
  const mate1LBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsLBracket.mate1Pos,
    wcsLBracket.mate1Rot,
    0,
    false,
    'mate1LBracket',
  )
  const mate2LBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsLBracket.mate2Pos,
    wcsLBracket.mate2Rot,
    0,
    false,
    'mate2LBracket',
  )
  const mate3LBracket = await api.createWorkCoordSystem(
    lBracket,
    WorkCoordSystemType.WCS_CUSTOM,
    [],
    [],
    wcsLBracket.mate3Pos,
    wcsLBracket.mate3Rot,
    0,
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
  const nutRef = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])
  const boltRef = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])

  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    { matePath: [boltRef], wcsId: mate1Bolt, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FOC1',
  )

  await api.createFastenedConstraint(
    nutBoltAsm,
    { matePath: [nutRef], wcsId: mate1Nut, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    { matePath: [boltRef], wcsId: mate1Bolt, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    -20,
    'FC1',
  )

  /* l-bracket assembly */
  const nutBoltRef0 = await api.addNode(nutBoltAsm, lBracketAsm, [pt0, xDir, yDir])
  const nutBoltRef1 = await api.addNode(nutBoltAsm, lBracketAsm, [pt1, xDir, yDir])
  const nutBoltRef2 = await api.addNode(nutBoltAsm, lBracketAsm, [pt2, xDir, yDir])
  const lBracketRef = await api.addNode(lBracket, lBracketAsm, [pt3, xDir, yDir])
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    { matePath: [lBracketRef], wcsId: mate1LBracket, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    20,
    'FOC2',
  )

  await api.createFastenedConstraint(
    lBracketAsm,
    { matePath: [lBracketRef], wcsId: mate1LBracket, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
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
    { matePath: [lBracketRef], wcsId: mate2LBracket, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
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
    { matePath: [lBracketRef], wcsId: mate3LBracket, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
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

export default create
