import { FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/Bolt.of1'
import arraybuffer3 from '../../shared/resources/LBracket.of1'
import arraybuffer2 from '../../shared/resources/Nut.of1'
import arraybuffer4 from '../../shared/resources/Plate.of1'
import arraybuffer5 from '../../shared/resources/Rod.of1'
import { ParamType } from '../store'

export const create = async (api: ApiHistory, params?: ParamType) => {
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  /* Create different variables to control expressions */
  const shaftDiameter = 10
  const shaftLength = 42
  const rodDiameter = shaftDiameter

  /* Create root assembly */
  const as1Asm = await api.createRootAssembly('Root_Assembly')

  /* Create assembly templates */
  const lBracketAsm = await api.createAssemblyAsTemplate('LBracket_Asm')
  const nutBoltAsm = await api.createAssemblyAsTemplate('NutBolt_Asm')
  const rodAsm = await api.createAssemblyAsTemplate('Rod_Asm')

  /* Load Bolt part */
  const bolt = await api.loadProduct(arraybuffer, 'of1')

  /* Set expressions on bolt part (optional) */
  api.setExpressions(
    bolt,
    { name: 'Shaft_Length', value: shaftLength },
    { name: 'Shaft_Diameter', value: shaftDiameter },
  )

  /* Add bolt to nut-bolt assembly template */
  const boltRefId = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])

  /* Get needed workcoordsystems of bolt */
  const wcsIdBoltNut = await api.getWorkCoordSystem(boltRefId, 'WCS_Nut')
  const wcsIdBoltHeadShaft = await api.getWorkCoordSystem(boltRefId, 'WCS_Head-Shaft')
  const wcsIdBoltOrigin = await api.getWorkCoordSystem(boltRefId, 'WCS_Origin')

  /* Load Nut part */
  const nut = await api.loadProduct(arraybuffer2, 'of1')

  /* Set expressions on bolt part (optional) */
  api.setExpressions(nut, { name: 'Hole_Diameter', value: shaftDiameter })

  /* Add nut to nut-bolt-assembly template */
  const nutRefId = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])

  /* Get needed workcoordsystems of nut */
  const wcsIdNut = await api.getWorkCoordSystem(nutRefId, 'WCS_Hole_Top')

  /* Set bolt to origin of nut-bolt-assembly */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    { refId: boltRefId, wcsId: wcsIdBoltOrigin[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FOC0',
  )

  /* Set nut on bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    { refId: boltRefId, wcsId: wcsIdBoltNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    { refId: nutRefId, wcsId: wcsIdNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FC1',
  )

  /* Load LBracket part */
  const lBracket = await api.loadProduct(arraybuffer3, 'of1')

  /* Set expressions on lBracket part (optional) */
  api.setExpressions(
    lBracket,
    { name: 'Rod_Hole_Diameter', value: rodDiameter },
    { name: 'Hole_Diameter', value: shaftDiameter },
  )

  /* Add lBracket to lbracket-assembly template */
  const lBracketRef1 = await api.addNode(lBracket, lBracketAsm, [pt0, xDir, yDir])

  /* Get needed workcoordsystems of lBracket */
  const wcsIdLBracket1 = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole1-Top')
  const wcsIdLBracket2Top = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole2-Top')
  const wcsIdLBracket2Bottom = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole2-Bottom')
  const wcsIdLBracket3 = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole3-Top')
  const wcsIdLBracketRod = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Rod')
  const wcsIdLBracketOrigin = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Origin')

  /* Add nut-bolt assembly three times to lBracket-assembly template */
  const nutBoltAsmRef1 = await api.addNode(nutBoltAsm, lBracketAsm, [pt0, xDir, yDir])
  const nutBoltAsmRef2 = await api.addNode(nutBoltAsm, lBracketAsm, [pt0, xDir, yDir])
  const nutBoltAsmRef3 = await api.addNode(nutBoltAsm, lBracketAsm, [pt0, xDir, yDir])

  /* Set lBracket to origin of lBracket-assembly */
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    {
      refId: lBracketRef1,
      wcsId: wcsIdLBracketOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC1',
  )

  /* Set 1st nut-bolt-assembly on lBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef1, wcsId: wcsIdLBracket1[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    {
      refId: nutBoltAsmRef1,
      wcsId: wcsIdBoltHeadShaft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC2',
  )

  /* Set 2nd nut-bolt-assembly on lBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      refId: lBracketRef1,
      wcsId: wcsIdLBracket2Top[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      refId: nutBoltAsmRef2,
      wcsId: wcsIdBoltHeadShaft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC3',
  )

  /* Set 3rd nut-bolt-assembly on lBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef1, wcsId: wcsIdLBracket3[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    {
      refId: nutBoltAsmRef3,
      wcsId: wcsIdBoltHeadShaft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC4',
  )

  /* Load Plate part */
  const plate = await api.loadProduct(arraybuffer4, 'of1')

  /* Set expressions on plate part (optional) */
  api.setExpressions(plate, { name: 'Hole_Diameter', value: shaftDiameter })

  /* Add nut to nut-bolt assembly template */
  const plateRef = await api.addNode(plate, as1Asm, [pt0, xDir, yDir])

  /* Get needed workcoordsystems of plate */
  const wcsIdPlateBase = await api.getWorkCoordSystem(plateRef, 'WCS_Origin')
  const wcsIdPlate2 = await api.getWorkCoordSystem(plateRef, 'WCS_Hole2-Top')
  const wcsIdPlate5 = await api.getWorkCoordSystem(plateRef, 'WCS_Hole5-Top')

  /* Set plate to origin of as1-assembly */
  await api.createFastenedOriginConstraint(
    as1Asm,
    { refId: plateRef, wcsId: wcsIdPlateBase[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FOC2',
  )

  /* Add nut to nut-bolt assembly template */
  const lBracketAsmRef1 = await api.addNode(lBracketAsm, as1Asm, [pt0, xDir, yDir])
  const lBracketAsmRef2 = await api.addNode(lBracketAsm, as1Asm, [pt0, xDir, yDir])

  /* Set 1st lBracket-assembly on plate */
  await api.createFastenedConstraint(
    as1Asm,
    { refId: plateRef, wcsId: wcsIdPlate2[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    {
      refId: lBracketAsmRef1,
      wcsId: wcsIdLBracket2Bottom[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC5',
  )

  /* Set 2nd lBracket-assembly on plate */
  await api.createFastenedConstraint(
    as1Asm,
    { refId: plateRef, wcsId: wcsIdPlate5[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    {
      refId: lBracketAsmRef2,
      wcsId: wcsIdLBracket2Bottom[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC6',
  )

  /* Load Rod part */
  const rod = await api.loadProduct(arraybuffer5, 'of1')

  /* Set expressions on rod part (optional) */
  api.setExpressions(rod, { name: 'Rod_Diameter', value: rodDiameter })

  /* Add nut to nut-bolt assembly template */
  const rodRefId = await api.addNode(rod, rodAsm, [pt0, xDir, yDir])

  /* Get needed workcoordsystems of rod */
  const wscIdRodLeft = await api.getWorkCoordSystem(rodRefId, 'WCS_Nut_Left')
  const wcsIdRodRight = await api.getWorkCoordSystem(rodRefId, 'WCS_Nut_Right')
  const wcsIdRodOrigin = await api.getWorkCoordSystem(rodRefId, 'WCS_Origin')

  /* Add nut to nut-bolt assembly template */
  const nutRefId1 = await api.addNode(nut, rodAsm, [pt0, xDir, yDir])
  const nutRefId2 = await api.addNode(nut, rodAsm, [pt0, xDir, yDir])

  /* Set rod to origin of rod-assembly */
  await api.createFastenedOriginConstraint(
    rodAsm,
    { refId: rodRefId, wcsId: wcsIdRodOrigin[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FOC3',
  )

  /* Set 1st nut on rod */
  await api.createFastenedConstraint(
    rodAsm,
    { refId: rodRefId, wcsId: wscIdRodLeft[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    { refId: nutRefId1, wcsId: wcsIdNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FC7',
  )

  /* Set 2nd nut on rod */
  await api.createFastenedConstraint(
    rodAsm,
    { refId: rodRefId, wcsId: wcsIdRodRight[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    { refId: nutRefId2, wcsId: wcsIdNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FC8',
  )

  /* Add nut to nut-bolt assembly template */
  const rodAsmRef = await api.addNode(rodAsm, as1Asm, [pt0, xDir, yDir])

  /* Set rod-assembly on lBracket of first lBracket-assembly */
  await api.createFastenedConstraint(
    as1Asm,
    {
      refId: lBracketAsmRef1,
      wcsId: wcsIdLBracketRod[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    { refId: rodAsmRef, wcsId: wscIdRodLeft[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FC9',
  )
  return as1Asm
}

export default create
