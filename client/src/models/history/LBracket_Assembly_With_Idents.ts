import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/As1/Bolt.ofb'
import arraybuffer3 from '../../resources/history/As1/LBracket.ofb'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 15
  const shaftLength = 37
  const rodDiameter = 30

  const lBracketAsm = await api.createRootAssembly('LBracket_Asm', { ident: 'LBracketRoot'})
  const nutBoltAsm = await api.createAssemblyAsTemplate('NutBolt_Asm')

  /* Bolt */
  const bolt = await api.loadProduct(arraybuffer, 'ofb', { ident: 'BoltProduct'})

  api.setExpressions({
    partId: 'BoltProduct',
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })
  const [boltRefId] = await api.addNodes({
    productId: bolt[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })

  const wcsIdBoltNut = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Nut')
  const wcsIdBoltHeadShaft = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Head-Shaft')
  const wcsIdBoltOrigin = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Origin')

  /* Nut */
  await api.loadProduct(arraybuffer2, 'ofb', { ident: 'NutProduct'})

  api.setExpressions({ partId: 'NutProduct', members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  const [nutRefId] = await api.addNodes({
    productId: 'NutProduct',
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
    options: { ident: 'NutNode'}
  })
  const wcsIdNut = await api.getWorkGeometry(nutRefId, CCClasses.CCWorkCoordSystem, 'WCS_Hole_Top')

  /* Set bolt to origin of nut-bolt-assembly */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    {
      matePath: await api.getMatePath(boltRefId),
      wcsId: wcsIdBoltOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC0',
  )

  /* Nut on Bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    {
      matePath: [boltRefId],
      wcsId: wcsIdBoltNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutRefId],
      wcsId: wcsIdNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC1',
  )

  /* LBracket */
  const lBracket = await api.loadProduct(arraybuffer3, 'ofb', { ident: 'LBracketProduct'})

  api.setExpressions({
    partId: 'LBracketProduct',
    members: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  const [lBracketRef1] = await api.addNodes({
    productId: lBracket[0],
    ownerId: 'LBracketRoot',
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  })
  const wcsIdLBracketOrigin = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCoordSystem, 'WCS_Origin')
  const wcsIdLBracket1 = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCoordSystem, 'WCS_Hole1-Top')
  const wcsIdLBracket2Top = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCoordSystem, 'WCS_Hole2-Top')
  const wcsIdLBracket3 = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCoordSystem, 'WCS_Hole3-Top')

  /* LBracket at origin */
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracketOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC',
  )

  const [nutBoltAsmRef1, nutBoltAsmRef2, nutBoltAsmRef3] = await api.addNodes({
    productId: nutBoltAsm,
    ownerId: 'LBracketRoot',
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
    options: { ident: 'NutBoltNode1'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'LBracketRoot',
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
    options: { ident: 'NutBoltNode2'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'LBracketRoot',
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
    options: { ident: 'NutBoltNode3'}
  })

  /* NutBoltAsm on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket1[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltAsmRef1],
      wcsId: wcsIdBoltHeadShaft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC2',
  )

  /* NutBoltAsm on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket2Top[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltAsmRef2],
      wcsId: wcsIdBoltHeadShaft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC3',
  )

  /* NutBoltAsm on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket3[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltAsmRef3],
      wcsId: wcsIdBoltHeadShaft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC4',
  )
  return lBracketAsm
}

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene } = await api.createScene(productId, { meshPerGeometry: false })
  console.info(scene)
  return scene
}

export const cad = new history()

export default { create, paramsMap, cad }
