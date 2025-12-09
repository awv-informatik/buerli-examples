import { Color } from 'three'
import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer3 from '../../resources/history/As1/LBracket.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import arraybuffer4 from '../../resources/history/As1/Plate.ofb?buffer'
import arraybuffer5 from '../../resources/history/As1/Rod.ofb?buffer'
import { Create, GetScene, Param } from '../../store'
import { findObjectsByName, setObjectColor, setObjectTransparency } from '../../utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const data = arraybuffer
const data3 = arraybuffer3
const data2 = arraybuffer2
const data4 = arraybuffer4
const data5 = arraybuffer5

export const create: Create = async (model, params?) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1

  /* Create different variables to control expressions */
  const shaftDiameter = 10
  const shaftLength = 42
  const rodDiameter = shaftDiameter

  /* Create root assembly */
  const as1Asm = await assemblyApi.create({ name: 'Root_Assembly' })

  /* Create assembly templates */
  const lBracketAsm = await assemblyApi.assemblyTemplate({ name: 'LBracket_Asm' })
  const nutBoltAsm = await assemblyApi.assemblyTemplate({ name: 'NutBolt_Asm' })
  const rodAsm = await assemblyApi.assemblyTemplate({ name: 'Rod_Asm' })

  /* Load Bolt part */
  const { id: bolt } = await assemblyApi.loadProduct({ data: data, format: 'OFB' })

  /* Set expressions on bolt part (optional) */
  await partApi.updateExpression({
    id: bolt,
    toUpdate: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })

  /* Add bolt to nut-bolt assembly template */
  const boltRefId = await assemblyApi.instance({
    productId: bolt,
    ownerId: nutBoltAsm,
  })

  /* Get needed workcoordsystems of bolt */
  const wcsIdBoltNut = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Nut' })
  const wcsIdBoltHeadShaft = await partApi.getWorkGeometry({
    id: boltRefId as number,
    name: 'WCS_Head-Shaft',
  })
  const wcsIdBoltOrigin = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Origin' })

  /* Load Nut part */
  const { id: nut } = await assemblyApi.loadProduct({ data: data2, format: 'OFB' })

  /* Set expressions on bolt part (optional) */
  await partApi.updateExpression({
    id: nut,
    toUpdate: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  /* Add nut to nut-bolt-assembly template */
  const nutRefId = await assemblyApi.instance({
    productId: nut,
    ownerId: nutBoltAsm,
  })

  /* Get needed workcoordsystems of nut */
  const wcsIdNut = await partApi.getWorkGeometry({ id: nutRefId as number, name: 'WCS_Hole_Top' })

  /* Set bolt to origin of nut-bolt-assembly */
  await assemblyApi.fastenedOrigin({
    id: nutBoltAsm,
    mate1: {
      path: [boltRefId as number],
      csys: wcsIdBoltOrigin,
    },
    name: 'FOC0',
  })

  /* Set nut on bolt */
  await assemblyApi.fastened({
    id: nutBoltAsm,
    mate1: {
      path: [boltRefId as number],
      csys: wcsIdBoltNut,
    },
    mate2: {
      path: [nutRefId as number],
      csys: wcsIdNut,
    },
    name: 'FC1',
  })

  /* Load LBracket part */
  const { id: lBracket } = await assemblyApi.loadProduct({ data: data3, format: 'OFB' })

  /* Set expressions on lBracket part (optional) */
  await partApi.updateExpression({
    id: lBracket,
    toUpdate: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  /* Add lBracket to lbracket-assembly template */
  const lBracketRef1 = await assemblyApi.instance({
    productId: lBracket,
    ownerId: lBracketAsm,
  })

  /* Get needed workcoordsystems of lBracket */
  const wcsIdLBracket1 = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole1-Top',
  })
  const wcsIdLBracket2Top = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole2-Top',
  })
  const wcsIdLBracket2Bottom = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole2-Bottom',
  })
  const wcsIdLBracket3 = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole3-Top',
  })
  const wcsIdLBracketRod = await partApi.getWorkGeometry({ id: lBracketRef1 as number, name: 'WCS_Rod' })
  const wcsIdLBracketOrigin = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Origin',
  })

  /* Add nut-bolt assembly three times to lBracket-assembly template */
  let res = await assemblyApi.instance([
    {
      productId: nutBoltAsm,
      ownerId: lBracketAsm,
    },
    {
      productId: nutBoltAsm,
      ownerId: lBracketAsm,
    },
    {
      productId: nutBoltAsm,
      ownerId: lBracketAsm,
    },
  ])
  const nutBoltAsmRefs = res as number[]

  /* Set lBracket to origin of lBracket-assembly */
  await assemblyApi.fastenedOrigin({
    id: lBracketAsm,
    mate1: { path: [lBracketRef1 as number], csys: wcsIdLBracketOrigin },
    name: 'FOC1',
  })

  /* Set 1st nut-bolt-assembly on lBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracket1,
    },
    mate2: {
      path: [boltRefId as number, nutBoltAsmRefs[0]],
      csys: wcsIdBoltHeadShaft,
    },
    name: 'FC2',
  })

  /* Set 2nd nut-bolt-assembly on lBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracket2Top,
    },
    mate2: {
      path: [boltRefId as number, nutBoltAsmRefs[1]],
      csys: wcsIdBoltHeadShaft,
    },
    name: 'FC3',
  })

  /* Set 3rd nut-bolt-assembly on lBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracket3,
    },
    mate2: {
      path: [boltRefId as number, nutBoltAsmRefs[2]],
      csys: wcsIdBoltHeadShaft,
    },
    name: 'FC4',
  })

  /* Load Plate part */
  const { id: plate } = await assemblyApi.loadProduct({ data: data4, format: 'OFB' })

  /* Set expressions on plate part (optional) */
  await partApi.updateExpression({
    id: plate,
    toUpdate: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  /* Add nut to nut-bolt assembly template */
  const plateRef = await assemblyApi.instance({
    productId: plate,
    ownerId: as1Asm,
  })

  /* Get needed workcoordsystems of plate */
  const wcsIdPlateBase = await partApi.getWorkGeometry({
    id: plateRef as number,
    name: 'WCS_Origin',
  })
  const wcsIdPlate2 = await partApi.getWorkGeometry({
    id: plateRef as number,
    name: 'WCS_Hole2-Top',
  })
  const wcsIdPlate5 = await partApi.getWorkGeometry({
    id: plateRef as number,
    name: 'WCS_Hole5-Top',
  })

  /* Set plate to origin of as1-assembly */
  await assemblyApi.fastenedOrigin({
    id: as1Asm,
    mate1: { path: [plateRef as number], csys: wcsIdPlateBase },
    name: 'FOC2',
  })

  /* Add nut to nut-bolt assembly template */
  res = await assemblyApi.instance([
    {
      productId: lBracketAsm,
      ownerId: as1Asm,
    },
    {
      productId: lBracketAsm,
      ownerId: as1Asm,
    },
  ])
  const lBracketAsmRefs = res as number[]

  /* Set 1st lBracket-assembly on plate */
  await assemblyApi.fastened({
    id: as1Asm,
    mate1: {
      path: [plateRef as number],
      csys: wcsIdPlate2,
    },
    mate2: {
      path: [lBracketRef1 as number, lBracketAsmRefs[0]],
      csys: wcsIdLBracket2Bottom,
    },
    name: 'FC5',
  })

  /* Set 2nd lBracket-assembly on plate */
  await assemblyApi.fastened({
    id: as1Asm,
    mate1: {
      path: [plateRef as number],
      csys: wcsIdPlate5,
    },
    mate2: {
      path: [lBracketRef1 as number, lBracketAsmRefs[1]],
      csys: wcsIdLBracket2Bottom,
    },
    name: 'FC6',
  })

  /* Load Rod part */
  const { id: rod } = await assemblyApi.loadProduct({ data: data5, format: 'OFB' })

  /* Set expressions on rod part (optional) */
  await partApi.updateExpression({
    id: rod,
    toUpdate: [{ name: 'Rod_Diameter', value: rodDiameter }],
  })

  /* Add nut to nut-bolt assembly template */
  const rodRefId = await assemblyApi.instance({
    productId: rod,
    ownerId: rodAsm,
  })

  /* Get needed workcoordsystems of rod */
  const wscIdRodLeft = await partApi.getWorkGeometry({
    id: rodRefId as number,
    name: 'WCS_Nut_Left',
  })
  const wcsIdRodRight = await partApi.getWorkGeometry({
    id: rodRefId as number,
    name: 'WCS_Nut_Right',
  })
  const wcsIdRodOrigin = await partApi.getWorkGeometry({
    id: rodRefId as number,
    name: 'WCS_Origin',
  })

  /* Add nut to nut-bolt assembly template */
  res = await assemblyApi.instance([
    {
      productId: nut,
      ownerId: rodAsm,
    },
    {
      productId: nut,
      ownerId: rodAsm,
    },
  ])
  const nutRefIds = res as number[]

  /* Set rod to origin of rod-assembly */
  await assemblyApi.fastenedOrigin({
    id: rodAsm,
    mate1: { path: [rodRefId as number], csys: wcsIdRodOrigin },
    name: 'FOC3',
  })

  /* Set 1st nut on rod */
  await assemblyApi.fastened({
    id: rodAsm,
    mate1: {
      path: [rodRefId as number],
      csys: wscIdRodLeft,
    },
    mate2: {
      path: [nutRefIds[0]],
      csys: wcsIdNut,
    },
    name: 'FC7',
  })

  /* Set 2nd nut on rod */
  await assemblyApi.fastened({
    id: rodAsm,
    mate1: {
      path: [rodRefId as number],
      csys: wcsIdRodRight,
    },
    mate2: {
      path: [nutRefIds[1]],
      csys: wcsIdNut,
    },
    name: 'FC8',
  })

  /* Add nut to nut-bolt assembly template */
  const rodAsmRef = await assemblyApi.instance({
    productId: rodAsm,
    ownerId: as1Asm,
  })

  /* Set rod-assembly on lBracket of first lBracket-assembly */
  await assemblyApi.fastened({
    id: as1Asm,
    mate1: {
      path: [lBracketRef1 as number, lBracketAsmRefs[0]],
      csys: wcsIdLBracketRod,
    },
    mate2: {
      path: [rodRefId as number, rodAsmRef as number],
      csys: wscIdRodLeft,
    },
    name: 'FC9',
  })
  return as1Asm
}

export const getScene: GetScene = async (model, productId) => {
  if (!model) return
  const { scene } = await model.createScene(productId as number, { meshPerGeometry: true })
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

export default { create, getScene, paramsMap }
