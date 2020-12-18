import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiHistory) => {
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
    'Custom',
    [],
    wcsNut.boxPos,
    wcsNut.boxRot,
    0,
    false,
    'wcsBoxNut',
  )
  const wcsCylNut = await api.createWorkCoordSystem(
    nut,
    'Custom',
    [],
    wcsNut.cylPos,
    wcsNut.cylRot,
    0,
    false,
    'wcsCylNut',
  )
  const mate1Nut = await api.createWorkCoordSystem(
    nut,
    'Custom',
    [],
    wcsNut.mate1Pos,
    wcsNut.mate1Rot,
    0,
    false,
    'mate1Nut',
  )
  const boxNut = api.box(nut, [wcsBoxNut], 30, 30, 10)
  const cylNut = api.cylinder(nut, [wcsCylNut], 20, 40)
  api.boolean(nut, 'Subtraction', [boxNut, cylNut])

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
    'Custom',
    [],
    wcsBolt.shaftPos,
    wcsBolt.shaftRot,
    0,
    false,
    'wcsShaftBolt',
  )
  const wcsHeadBolt = await api.createWorkCoordSystem(
    bolt,
    'Custom',
    [],
    wcsBolt.headPos,
    wcsBolt.headRot,
    0,
    false,
    'wcsHeadBolt',
  )
  const mate1Bolt = await api.createWorkCoordSystem(
    bolt,
    'Custom',
    [],
    wcsBolt.mate1Pos,
    wcsBolt.mate1Rot,
    0,
    false,
    'mate1Bolt',
  )
  const shaft = api.cylinder(bolt, [wcsShaftBolt], 20, 60)
  const head = api.cylinder(bolt, [wcsHeadBolt], 30, 10)
  api.boolean(bolt, 'Union', [shaft, head])

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
    'Custom',
    [],
    wcsLBracket.basePos,
    wcsLBracket.baseRot,
    0,
    false,
    'wcsBaseBracket',
  )
  const wcsSubBracket = await api.createWorkCoordSystem(
    lBracket,
    'Custom',
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
    'Custom',
    [],
    wcsLBracket.mate1Pos,
    wcsLBracket.mate1Rot,
    0,
    false,
    'mate1LBracket',
  )
  const mate2LBracket = await api.createWorkCoordSystem(
    lBracket,
    'Custom',
    [],
    wcsLBracket.mate2Pos,
    wcsLBracket.mate2Rot,
    0,
    false,
    'mate2LBracket',
  )
  const mate3LBracket = await api.createWorkCoordSystem(
    lBracket,
    'Custom',
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
  api.boolean(lBracket, 'Subtraction', [baseBracket, subBracket, sub1Bracket, sub2Bracket, sub3Bracket])

  /* nut-bolt assembly */
  const nutBoltAsm = await api.createAssemblyAsTemplate('Nut_Bolt_Assembly')
  const nutRef = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])
  const boltRef = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])
  await api.createFastenedConstraint(
    nutBoltAsm,
    { refId: nutRef, wcsId: mate1Nut },
    { refId: boltRef, wcsId: mate1Bolt },
    0,
    0,
    -20,
    0,
    0,
    'FC1',
  )

  /* l-bracket assembly */
  const nutBoltRef0 = await api.addNode(nutBoltAsm, lBracketAsm, [pt0, xDir, yDir])
  const nutBoltRef1 = await api.addNode(nutBoltAsm, lBracketAsm, [pt1, xDir, yDir])
  const nutBoltRef2 = await api.addNode(nutBoltAsm, lBracketAsm, [pt2, xDir, yDir])
  const lBracketRef = await api.addNode(lBracket, lBracketAsm, [pt3, xDir, yDir])
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef, wcsId: mate1LBracket },
    { refId: nutBoltRef0, wcsId: wcsShaftBolt },
    0,
    0,
    20,
    1,
    0,
    'FC2',
  )
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef, wcsId: mate2LBracket },
    { refId: nutBoltRef1, wcsId: wcsShaftBolt },
    0,
    0,
    20,
    1,
    0,
    'FC3',
  )
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef, wcsId: mate3LBracket },
    { refId: nutBoltRef2, wcsId: wcsShaftBolt },
    0,
    0,
    20,
    1,
    0,
    'FC4',
  )
  const geoms = await api.createBufferGeometry(lBracketAsm)
  api.saveFile('C:/temp/TestAssemblyBuilding.of1')

  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
