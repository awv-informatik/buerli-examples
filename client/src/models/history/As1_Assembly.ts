import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import { Color } from 'three'
import arraybuffer from '../../resources/history/As1/Bolt.ofb'
import arraybuffer3 from '../../resources/history/As1/LBracket.ofb'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb'
import arraybuffer4 from '../../resources/history/As1/Plate.ofb'
import arraybuffer5 from '../../resources/history/As1/Rod.ofb'
import { Create, Param } from '../../store'
import { findObjectsByName, setObjectColor, setObjectTransparency } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params?) => {
  const api = apiType as ApiHistory

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
  const bolt = await api.loadProduct(arraybuffer, 'ofb')

  /* Set expressions on bolt part (optional) */
  api.setExpressions({
    partId: bolt[0],
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })

  /* Add bolt to nut-bolt assembly template */
  const [boltRefId] = await api.addInstances({
    productId: bolt[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of bolt */
  const wcsIdBoltNut = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Nut')
  const wcsIdBoltHeadShaft = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Head-Shaft')
  const wcsIdBoltOrigin = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Origin')

  /* Load Nut part */
  const nut = await api.loadProduct(arraybuffer2, 'ofb')

  /* Set expressions on bolt part (optional) */
  api.setExpressions({ partId: nut[0], members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  /* Add nut to nut-bolt-assembly template */
  const [nutRefId] = await api.addInstances({
    productId: nut[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of nut */
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

  /* Set nut on bolt */
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

  /* Load LBracket part */
  const lBracket = await api.loadProduct(arraybuffer3, 'ofb')

  /* Set expressions on lBracket part (optional) */
  api.setExpressions({
    partId: lBracket[0],
    members: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  /* Add lBracket to lbracket-assembly template */
  const [lBracketRef1] = await api.addInstances({
    productId: lBracket[0],
    ownerId: lBracketAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of lBracket */
  const wcsIdLBracket1 = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole1-Top')
  const wcsIdLBracket2Top = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole2-Top')
  const wcsIdLBracket2Bottom = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole2-Bottom')
  const wcsIdLBracket3 = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole3-Top')
  const wcsIdLBracketRod = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Rod')
  const wcsIdLBracketOrigin = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Origin')

  /* Add nut-bolt assembly three times to lBracket-assembly template */
  const nutBoltAsmRefs = await api.addInstances({
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [pt0, xDir, yDir],
  }, {
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [pt0, xDir, yDir],
  }, {
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Set lBracket to origin of lBracket-assembly */
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
    'FOC1',
  )

  /* Set 1st nut-bolt-assembly on lBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket1[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltAsmRefs[0]],
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
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket2Top[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltAsmRefs[1]],
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
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket3[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutBoltAsmRefs[2]],
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
  const plate = await api.loadProduct(arraybuffer4, 'ofb')

  /* Set expressions on plate part (optional) */
  api.setExpressions({
    partId: plate[0],
    members: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  /* Add nut to nut-bolt assembly template */
  const [plateRef] = await api.addInstances({
    productId: plate[0],
    ownerId: as1Asm,
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of plate */
  const wcsIdPlateBase = await api.getWorkGeometry(plateRef, CCClasses.CCWorkCSys, 'WCS_Origin')
  const wcsIdPlate2 = await api.getWorkGeometry(plateRef, CCClasses.CCWorkCSys, 'WCS_Hole2-Top')
  const wcsIdPlate5 = await api.getWorkGeometry(plateRef, CCClasses.CCWorkCSys, 'WCS_Hole5-Top')

  /* Set plate to origin of as1-assembly */
  api.createFastenedOriginConstraint(
    as1Asm,
    {
      matePath: [plateRef],
      wcsId: wcsIdPlateBase[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC2',
  )

  /* Add nut to nut-bolt assembly template */
  const lBracketAsmRefs = await api.addInstances({
    productId: lBracketAsm,
    ownerId: as1Asm,
    transformation: [pt0, xDir, yDir],
  }, {
    productId: lBracketAsm,
    ownerId: as1Asm,
    transformation: [pt0, xDir, yDir],
  })

  /* Set 1st lBracket-assembly on plate */
  await api.createFastenedConstraint(
    as1Asm,
    {
      matePath: [plateRef],
      wcsId: wcsIdPlate2[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [lBracketAsmRefs[0]],
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
    {
      matePath: [plateRef],
      wcsId: wcsIdPlate5[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [lBracketAsmRefs[1]],
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
  const rod = await api.loadProduct(arraybuffer5, 'ofb')

  /* Set expressions on rod part (optional) */
  api.setExpressions({ partId: rod[0], members: [{ name: 'Rod_Diameter', value: rodDiameter }] })

  /* Add nut to nut-bolt assembly template */
  const [rodRefId] = await api.addInstances({
    productId: rod[0],
    ownerId: rodAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of rod */
  const wscIdRodLeft = await api.getWorkGeometry(rodRefId, CCClasses.CCWorkCSys, 'WCS_Nut_Left')
  const wcsIdRodRight = await api.getWorkGeometry(rodRefId, CCClasses.CCWorkCSys, 'WCS_Nut_Right')
  const wcsIdRodOrigin = await api.getWorkGeometry(rodRefId, CCClasses.CCWorkCSys, 'WCS_Origin')

  /* Add nut to nut-bolt assembly template */
  const nutRefIds = await api.addInstances({
    productId: nut[0],
    ownerId: rodAsm,
    transformation: [pt0, xDir, yDir],
  }, {
    productId: nut[0],
    ownerId: rodAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Set rod to origin of rod-assembly */
  await api.createFastenedOriginConstraint(
    rodAsm,
    {
      matePath: [rodRefId],
      wcsId: wcsIdRodOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC3',
  )

  /* Set 1st nut on rod */
  await api.createFastenedConstraint(
    rodAsm,
    {
      matePath: [rodRefId],
      wcsId: wscIdRodLeft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutRefIds[0]],
      wcsId: wcsIdNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC7',
  )

  /* Set 2nd nut on rod */
  await api.createFastenedConstraint(
    rodAsm,
    {
      matePath: [rodRefId],
      wcsId: wcsIdRodRight[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutRefIds[1]],
      wcsId: wcsIdNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC8',
  )

  /* Add nut to nut-bolt assembly template */
  const [rodAsmRef] = await api.addInstances({
    productId: rodAsm,
    ownerId: as1Asm,
    transformation: [pt0, xDir, yDir],
  })

  /* Set rod-assembly on lBracket of first lBracket-assembly */
  await api.createFastenedConstraint(
    as1Asm,
    {
      matePath: [lBracketAsmRefs[0]],
      wcsId: wcsIdLBracketRod[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [rodAsmRef],
      wcsId: wscIdRodLeft[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC9',
  )
  return as1Asm
}

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene } = await api.createScene(productId, { meshPerGeometry: true })
  scene && colorize(scene)
  return scene
}

const colorize = (scene: THREE.Scene) => {
  // Color the first found object with name = 'Bolt'
  const [boltObj] = findObjectsByName('Bolt', scene)
  setObjectColor(boltObj, new Color('rgb(203, 67, 22)'))
  // Color all objects with name = 'Nut'
  const nutObjs = findObjectsByName('Nut', scene)
  nutObjs.forEach(nutObj => {
    setObjectColor(nutObj, new Color('rgb(23, 67, 180)'))
  })
  // Color a subassembly object with all its children
  const nutBoltObjs = findObjectsByName('NutBolt_Asm', scene)
  setObjectColor(nutBoltObjs[1], new Color('rgb(27, 196, 44)'))
  // ...
  const [lBracketObj] = findObjectsByName('LBracket', scene)
  setObjectColor(lBracketObj, new Color('rgb(220, 150, 20)'))
  // Set color and transparency on the first found object with name = 'Plate'
  const [plateObj] = findObjectsByName('Plate', scene)
  setObjectColor(plateObj, new Color('rgb(120, 80, 79)'))
  setObjectTransparency(plateObj, 0.3)
  // ...
  const [rodObj] = findObjectsByName('Rod', scene)
  setObjectColor(rodObj, new Color('rgb(178, 0, 13)'))
}

export const cad = new history()

export default { create, getScene, paramsMap, cad }
