import { FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/Bolt.of1'
import arraybuffer3 from '../../shared/resources/LBracket.of1'
import arraybuffer2 from '../../shared/resources/Nut.of1'
import { ParamType } from '../store'

export const create = async (api: ApiHistory, params?: ParamType) => {
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 10
  const shaftLength = 37
  const rodDiameter = 10

  const lBracketAsm = await api.createRootAssembly('LBracket_Asm')
  const nutBoltAsm = await api.createAssemblyAsTemplate('NutBolt_Asm')

  /* Bolt */
  const boltProduct = await api.loadProduct(arraybuffer, 'of1')
  const bolt = boltProduct[0]

  api.setExpressions(
    bolt,
    { name: 'Shaft_Length', value: shaftLength },
    { name: 'Shaft_Diameter', value: shaftDiameter },
  )
  const boltRefId = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])

  const wcsIdBoltNut = await api.getWorkCoordSystem(boltRefId, 'WCS_Nut')
  const wcsIdBoltHeadShaft = await api.getWorkCoordSystem(boltRefId, 'WCS_Head-Shaft')
  const wcsIdBoltOrigin = await api.getWorkCoordSystem(boltRefId, 'WCS_Origin')

  /* Nut */
  const nutProduct = await api.loadProduct(arraybuffer2, 'of1')
  const nut = nutProduct[0]

  api.setExpressions(nut, { name: 'Hole_Diameter', value: shaftDiameter })

  const nutRefId = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])
  const wcsIdNut = await api.getWorkCoordSystem(nutRefId, 'WCS_Hole_Top')

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
    { matePath: [boltRefId], wcsId: wcsIdBoltNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    { matePath: [nutRefId], wcsId: wcsIdNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FC1',
  )

  /* LBracket */
  const lBracketProduct = await api.loadProduct(arraybuffer3, 'of1')
  const lBracket = lBracketProduct[0]

  api.setExpressions(
    lBracket,
    { name: 'Rod_Hole_Diameter', value: rodDiameter },
    { name: 'Hole_Diameter', value: shaftDiameter },
  )

  const lBracketRef1 = await api.addNode(lBracket, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])
  const wcsIdLBracketOrigin = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Origin')
  const wcsIdLBracket1 = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole1-Top')
  const wcsIdLBracket2Top = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole2-Top')
  const wcsIdLBracket3 = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole3-Top')

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

  const nutBoltAsmRef1 = await api.addNode(nutBoltAsm, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])
  const nutBoltAsmRef2 = await api.addNode(nutBoltAsm, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])
  const nutBoltAsmRef3 = await api.addNode(nutBoltAsm, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])

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

export default create
