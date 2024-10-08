import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, History } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer3 from '../../resources/history/As1/LBracket.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 10
  const shaftLength = 37
  const rodDiameter = 10

  const lBracketAsm = await api.createRootAssembly('LBracket_Asm')
  const nutBoltAsm = await api.createAssemblyAsTemplate('NutBolt_Asm')

  /* Bolt */
  const bolt = await api.loadProduct(arraybuffer, 'ofb')

  api.setExpressions({
    partId: bolt[0],
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })
  const [boltRefId] = await api.addInstances({
    productId: bolt[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })

  const wcsIdBoltNut = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Nut')
  const wcsIdBoltHeadShaft = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Head-Shaft')
  const wcsIdBoltOrigin = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Origin')

  /* Nut */
  const nut = await api.loadProduct(arraybuffer2, 'ofb')

  api.setExpressions({ partId: nut[0], members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  const [nutRefId] = await api.addInstances({
    productId: nut[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })
  const wcsIdNut = await api.getWorkGeometry(nutRefId, CCClasses.CCWorkCSys, 'WCS_Hole_Top')

  /* Set bolt to origin of nut-bolt-assembly */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    {
      matePath: [boltRefId],
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
  const lBracket = await api.loadProduct(arraybuffer3, 'ofb')

  api.setExpressions({
    partId: lBracket[0],
    members: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  const [lBracketRef1] = await api.addInstances({
    productId: lBracket[0],
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  })
  const wcsIdLBracketOrigin = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Origin')
  const wcsIdLBracket1 = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole1-Top')
  const wcsIdLBracket2Top = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole2-Top')
  const wcsIdLBracket3 = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole3-Top')

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

  const [nutBoltAsmRef1, nutBoltAsmRef2, nutBoltAsmRef3] = await api.addInstances({
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  }, {
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  }, {
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
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

export const cad = new History()

export default { create, paramsMap, cad }
