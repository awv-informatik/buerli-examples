import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1
  /* consts */
  const pt1 = { x: 50, y: 0, z: 0 }
  const pt2 = { x: 100, y: 0, z: 0 }
  const pt3 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }
  const nullPos = { x: 0, y: 0, z: 0 }
  const nullRot = { x: 0, y: 0, z: 0 }

  /* root assembly */
  const lBracketAsm = await assemblyApi.create({ name: 'L_Bracket_Assembly' })

  /* nut part */
  const wcsNut = {
    boxPos: nullPos,
    boxRot: nullRot,
    cylPos: { x: 15, y: 15, z: 0 },
    cylRot: nullRot,
    mate1Pos: { x: 15, y: 15, z: 0 },
    mate1Rot: nullRot,
  }
  const nut = await assemblyApi.partTemplate({ name: 'Nut' })
  const wcsBoxNut = await partApi.workCSys({
    id: nut,
    type: 'CUSTOM',
    offset: wcsNut.boxPos,
    rotation: wcsNut.boxRot,
    name: 'wcsBoxNut',
  })

  const wcsCylNut = await partApi.workCSys({
    id: nut,
    type: 'CUSTOM',
    offset: wcsNut.cylPos,
    rotation: wcsNut.cylRot,
    name: 'wcsCylNut',
  })

  const mate1Nut = await partApi.workCSys({
    id: nut,
    type: 'CUSTOM',
    offset: wcsNut.mate1Pos,
    rotation: wcsNut.mate1Rot,
    name: 'mate1Nut',
  })

  const boxNut = await partApi.box({ id: nut, references: [wcsBoxNut], length: 30, width: 30, height: 10 })
  const cylNut = await partApi.cylinder({ id: nut, references: [wcsCylNut], diameter: 20, height: 40 })
  await partApi.boolean({ id: nut, type: 'SUBTRACTION', target: boxNut, tools: [cylNut] })

  /* bolt part */
  const wcsBolt = {
    shaftPos: { x: 0, y: 0, z: 0 },
    shaftRot: nullRot,
    headPos: { x: 0, y: 0, z: -10 },
    headRot: nullRot,
    mate1Pos: nullPos,
    mate1Rot: nullRot,
  }
  const bolt = await assemblyApi.partTemplate({ name: 'Bolt' })
  const wcsShaftBolt = await partApi.workCSys({
    id: bolt,
    type: 'CUSTOM',
    offset: wcsBolt.shaftPos,
    rotation: wcsBolt.shaftRot,
    name: 'wcsShaftBolt',
  })

  const wcsHeadBolt = await partApi.workCSys({
    id: bolt,
    type: 'CUSTOM',
    offset: wcsBolt.headPos,
    rotation: wcsBolt.headRot,
    name: 'wcsHeadBolt',
  })

  const mate1Bolt = await partApi.workCSys({
    id: bolt,
    type: 'CUSTOM',
    offset: wcsBolt.mate1Pos,
    rotation: wcsBolt.mate1Rot,
    name: 'mate1Bolt',
  })

  const shaft = await partApi.cylinder({ id: bolt, references: [wcsShaftBolt], diameter: 20, height: 60 })
  const head = await partApi.cylinder({ id: bolt, references: [wcsHeadBolt], diameter: 30, height: 10 })
  await partApi.boolean({ id: bolt, type: 'UNION', target: shaft, tools: [head] })

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
  const lBracket = await assemblyApi.partTemplate({ name: 'L_Bracket' })
  const wcsBaseBracket = await partApi.workCSys({
    id: lBracket,
    type: 'CUSTOM',
    offset: wcsLBracket.basePos,
    rotation: wcsLBracket.baseRot,
    name: 'wcsBaseBracket',
  })

  const wcsSubBracket = await partApi.workCSys({
    id: lBracket,
    type: 'CUSTOM',
    offset: wcsLBracket.subPos,
    rotation: wcsLBracket.subRot,
    name: 'wcsSubBracket',
  })

  const baseBracket = await partApi.box({
    id: lBracket,
    references: [wcsBaseBracket],
    length: 100,
    width: 200,
    height: 100,
  })
  const subBracket = await partApi.box({
    id: lBracket,
    references: [wcsSubBracket],
    length: 100,
    width: 200,
    height: 100,
  })
  const mate1LBracket = await partApi.workCSys({
    id: lBracket,
    type: 'CUSTOM',
    offset: wcsLBracket.mate1Pos,
    rotation: wcsLBracket.mate1Rot,
    name: 'mate1LBracket',
  })

  const mate2LBracket = await partApi.workCSys({
    id: lBracket,
    type: 'CUSTOM',
    offset: wcsLBracket.mate2Pos,
    rotation: wcsLBracket.mate2Rot,
    name: 'mate2LBracket',
  })

  const mate3LBracket = await partApi.workCSys({
    id: lBracket,
    type: 'CUSTOM',
    offset: wcsLBracket.mate3Pos,
    rotation: wcsLBracket.mate3Rot,
    name: 'mate3LBracket',
  })

  const sub1Bracket = await partApi.cylinder({
    id: lBracket,
    references: [mate1LBracket],
    diameter: 20,
    height: 40,
  })
  const sub2Bracket = await partApi.cylinder({
    id: lBracket,
    references: [mate2LBracket],
    diameter: 20,
    height: 40,
  })
  const sub3Bracket = await partApi.cylinder({
    id: lBracket,
    references: [mate3LBracket],
    diameter: 20,
    height: 40,
  })
  await partApi.boolean({
    id: lBracket,
    type: 'SUBTRACTION',
    target: { id: baseBracket },
    tools: [subBracket, sub1Bracket, sub2Bracket, sub3Bracket],
  })

  /* nut-bolt assembly */
  const nutBoltAsm = await assemblyApi.assemblyTemplate({ name: 'Nut_Bolt_Assembly' })
  let res = await assemblyApi.instance([
    { productId: nut, ownerId: nutBoltAsm },
    { productId: bolt, ownerId: nutBoltAsm },
  ])
  const [nutRef, boltRef] = res as number[]

  await assemblyApi.fastenedOrigin({
    id: nutBoltAsm,
    mate1: {
      path: [boltRef],
      csys: mate1Bolt,
      flip: 'Z',
      reorient: '0',
    },
    name: 'FOC1',
  })

  await assemblyApi.fastened({
    id: nutBoltAsm,
    mate1: {
      path: [nutRef],
      csys: mate1Nut,
    },
    mate2: {
      path: [boltRef],
      csys: mate1Bolt,
    },
    zOffset: -20,
    name: 'FC1',
  })

  /* l-bracket assembly */
  res = await assemblyApi.instance([
    { productId: nutBoltAsm, ownerId: lBracketAsm },
    { productId: nutBoltAsm, ownerId: lBracketAsm, transformation: [pt1, xDir, yDir] },
    { productId: nutBoltAsm, ownerId: lBracketAsm, transformation: [pt2, xDir, yDir] },
    { productId: lBracket, ownerId: lBracketAsm, transformation: [pt3, xDir, yDir] },
  ])

  const [nutBoltRef0, nutBoltRef1, nutBoltRef2, lBracketRef] = res as number[]
  await assemblyApi.fastenedOrigin({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef],
      csys: mate1LBracket,
    },
    zOffset: 20,
    name: 'FOC2',
  })

  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef],
      csys: mate1LBracket,
    },
    mate2: {
      path: [nutBoltRef0],
      csys: wcsShaftBolt,
      flip: '-Z',
    },
    zOffset: 20,
    name: 'FC2',
  })

  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef],
      csys: mate2LBracket,
    },
    mate2: {
      path: [nutBoltRef1],
      csys: wcsShaftBolt,
      flip: '-Z',
    },
    zOffset: 20,
    name: 'FC3',
  })

  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef],
      csys: mate3LBracket,
    },
    mate2: {
      path: [nutBoltRef2],
      csys: wcsShaftBolt,
      flip: '-Z',
    },
    zOffset: 20,
    name: 'FC4',
  })

  return lBracketAsm
}

export default { create, paramsMap }
