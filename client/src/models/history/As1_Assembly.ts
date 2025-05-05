import { Color } from 'three'
import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer3 from '../../resources/history/As1/LBracket.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import arraybuffer4 from '../../resources/history/As1/Plate.ofb?buffer'
import arraybuffer5 from '../../resources/history/As1/Rod.ofb?buffer'
import { Create, GetScene, Param } from '../../store'
import { findObjectsByName, setObjectColor, setObjectTransparency } from '../../utils/utils'
import { Buffer } from 'buffer'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const data = Buffer.from(arraybuffer).toString('base64')
const data3 = Buffer.from(arraybuffer3).toString('base64')
const data2 = Buffer.from(arraybuffer2).toString('base64')
const data4 = Buffer.from(arraybuffer4).toString('base64')
const data5 = Buffer.from(arraybuffer5).toString('base64')

export const create: Create = async (model, params?) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1

  /* Create different variables to control expressions */
  const shaftDiameter = 10
  const shaftLength = 42
  const rodDiameter = shaftDiameter

  /* Create root assembly */
  const { result: as1Asm } = await assemblyApi.create({ name: 'Root_Assembly' })

  /* Create assembly templates */
  const { result: lBracketAsm } = await assemblyApi.assemblyTemplate({ name: 'LBracket_Asm' })
  const { result: nutBoltAsm } = await assemblyApi.assemblyTemplate({ name: 'NutBolt_Asm' })
  const { result: rodAsm } = await assemblyApi.assemblyTemplate({ name: 'Rod_Asm' })

  /* Load Bolt part */
  const { result: { id: bolt } } = await assemblyApi.loadProduct({ data: data, format: 'OFB', encoding: 'base64' })

  /* Set expressions on bolt part (optional) */
  await partApi.updateExpression({
    id: bolt,
    toUpdate: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })

  /* Add bolt to nut-bolt assembly template */
  const { result: boltRefId } = await assemblyApi.instance({
    productId: bolt,
    ownerId: nutBoltAsm,
  })

  /* Get needed workcoordsystems of bolt */
  const { result: wcsIdBoltNut } = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Nut' })
  const { result: wcsIdBoltHeadShaft } = await partApi.getWorkGeometry({
    id: boltRefId as number,
    name: 'WCS_Head-Shaft',
  })
  const { result: wcsIdBoltOrigin } = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Origin' })

  /* Load Nut part */
  const { result: { id: nut } } = await assemblyApi.loadProduct({ data: data2, format: 'OFB', encoding: 'base64' })

  /* Set expressions on bolt part (optional) */
  await partApi.updateExpression({
    id: nut,
    toUpdate: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  /* Add nut to nut-bolt-assembly template */
  const { result: nutRefId } = await assemblyApi.instance({
    productId: nut,
    ownerId: nutBoltAsm,
  })

  /* Get needed workcoordsystems of nut */
  const { result: wcsIdNut } = await partApi.getWorkGeometry({ id: nutRefId as number, name: 'WCS_Hole_Top' })

  /* Set bolt to origin of nut-bolt-assembly */
  await assemblyApi.fastenedOrigin({
    id: nutBoltAsm,
    mate1: {
      matePath: [boltRefId as number],
      wcsId: wcsIdBoltOrigin,
    },
    name: 'FOC0',
  })

  /* Set nut on bolt */
  await assemblyApi.fastened({
    id: nutBoltAsm,
    mate1: {
      matePath: [boltRefId as number],
      wcsId: wcsIdBoltNut,
    },
    mate2: {
      matePath: [nutRefId as number],
      wcsId: wcsIdNut,
    },
    name: 'FC1',
  })

  /* Load LBracket part */
  const { result: { id: lBracket } } = await assemblyApi.loadProduct({ data: data3, format: 'OFB', encoding: 'base64' })

  /* Set expressions on lBracket part (optional) */
  await partApi.updateExpression({
    id: lBracket,
    toUpdate: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  /* Add lBracket to lbracket-assembly template */
  const { result: lBracketRef1 } = await assemblyApi.instance({
    productId: lBracket,
    ownerId: lBracketAsm,
  })

  /* Get needed workcoordsystems of lBracket */
  const { result: wcsIdLBracket1 } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole1-Top',
  })
  const { result: wcsIdLBracket2Top } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole2-Top',
  })
  const { result: wcsIdLBracket2Bottom } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole2-Bottom',
  })
  const { result: wcsIdLBracket3 } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole3-Top',
  })
  const { result: wcsIdLBracketRod } = await partApi.getWorkGeometry({ id: lBracketRef1 as number, name: 'WCS_Rod' })
  const { result: wcsIdLBracketOrigin } = await partApi.getWorkGeometry({
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
  const nutBoltAsmRefs = res.result as number[]

  /* Set lBracket to origin of lBracket-assembly */
  await assemblyApi.fastenedOrigin({
    id: lBracketAsm,
    mate1: { matePath: [lBracketRef1 as number], wcsId: wcsIdLBracketOrigin },
    name: 'FOC1',
  })

  /* Set 1st nut-bolt-assembly on lBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      matePath: [lBracketRef1 as number],
      wcsId: wcsIdLBracket1,
    },
    mate2: {
      matePath: [nutBoltAsmRefs[0]],
      wcsId: wcsIdBoltHeadShaft,
    },
    name: 'FC2',
  })

  /* Set 2nd nut-bolt-assembly on lBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      matePath: [lBracketRef1 as number],
      wcsId: wcsIdLBracket2Top,
    },
    mate2: {
      matePath: [nutBoltAsmRefs[1]],
      wcsId: wcsIdBoltHeadShaft,
    },
    name: 'FC3',
  })

  /* Set 3rd nut-bolt-assembly on lBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      matePath: [lBracketRef1 as number],
      wcsId: wcsIdLBracket3,
    },
    mate2: {
      matePath: [nutBoltAsmRefs[2]],
      wcsId: wcsIdBoltHeadShaft,
    },
    name: 'FC4',
  })

  /* Load Plate part */
  const { result: { id: plate } } = await assemblyApi.loadProduct({ data: data4, format: 'OFB', encoding: 'base64' })

  /* Set expressions on plate part (optional) */
  await partApi.updateExpression({
    id: plate,
    toUpdate: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  /* Add nut to nut-bolt assembly template */
  const { result: plateRef } = await assemblyApi.instance({
    productId: plate,
    ownerId: as1Asm,
  })

  /* Get needed workcoordsystems of plate */
  const { result: wcsIdPlateBase } = await partApi.getWorkGeometry({
    id: plateRef as number,
    name: 'WCS_Origin',
  })
  const { result: wcsIdPlate2 } = await partApi.getWorkGeometry({
    id: plateRef as number,
    name: 'WCS_Hole2-Top',
  })
  const { result: wcsIdPlate5 } = await partApi.getWorkGeometry({
    id: plateRef as number,
    name: 'WCS_Hole5-Top',
  })

  /* Set plate to origin of as1-assembly */
  await assemblyApi.fastenedOrigin({
    id: as1Asm,
    mate1: { matePath: [plateRef as number], wcsId: wcsIdPlateBase },
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
  const lBracketAsmRefs = res.result as number[]

  /* Set 1st lBracket-assembly on plate */
  await assemblyApi.fastened({
    id: as1Asm,
    mate1: {
      matePath: [plateRef as number],
      wcsId: wcsIdPlate2,
    },
    mate2: {
      matePath: [lBracketAsmRefs[0]],
      wcsId: wcsIdLBracket2Bottom,
    },
    name: 'FC5',
  })

  /* Set 2nd lBracket-assembly on plate */
  await assemblyApi.fastened({
    id: as1Asm,
    mate1: {
      matePath: [plateRef as number],
      wcsId: wcsIdPlate5,
    },
    mate2: {
      matePath: [lBracketAsmRefs[1]],
      wcsId: wcsIdLBracket2Bottom,
    },
    name: 'FC6',
  })

  /* Load Rod part */
  const { result: { id: rod } } = await assemblyApi.loadProduct({ data: data5, format: 'OFB', encoding: 'base64' })

  /* Set expressions on rod part (optional) */
  await partApi.updateExpression({
    id: rod,
    toUpdate: [{ name: 'Rod_Diameter', value: rodDiameter }],
  })

  /* Add nut to nut-bolt assembly template */
  const { result: rodRefId } = await assemblyApi.instance({
    productId: rod,
    ownerId: rodAsm,
  })

  /* Get needed workcoordsystems of rod */
  const { result: wscIdRodLeft } = await partApi.getWorkGeometry({
    id: rodRefId as number,
    name: 'WCS_Nut_Left',
  })
  const { result: wcsIdRodRight } = await partApi.getWorkGeometry({
    id: rodRefId as number,
    name: 'WCS_Nut_Right',
  })
  const { result: wcsIdRodOrigin } = await partApi.getWorkGeometry({
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
  const nutRefIds = res.result as number[]

  /* Set rod to origin of rod-assembly */
  await assemblyApi.fastenedOrigin({
    id: rodAsm,
    mate1: { matePath: [rodRefId as number], wcsId: wcsIdRodOrigin },
    name: 'FOC3',
  })

  /* Set 1st nut on rod */
  await assemblyApi.fastened({
    id: rodAsm,
    mate1: {
      matePath: [rodRefId as number],
      wcsId: wscIdRodLeft,
    },
    mate2: {
      matePath: [nutRefIds[0]],
      wcsId: wcsIdNut,
    },
    name: 'FC7',
  })

  /* Set 2nd nut on rod */
  await assemblyApi.fastened({
    id: rodAsm,
    mate1: {
      matePath: [rodRefId as number],
      wcsId: wcsIdRodRight,
    },
    mate2: {
      matePath: [nutRefIds[1]],
      wcsId: wcsIdNut,
    },
    name: 'FC8',
  })

  /* Add nut to nut-bolt assembly template */
  const { result: rodAsmRef } = await assemblyApi.instance({
    productId: rodAsm,
    ownerId: as1Asm,
  })

  /* Set rod-assembly on lBracket of first lBracket-assembly */
  await assemblyApi.fastened({
    id: as1Asm,
    mate1: {
      matePath: [lBracketAsmRefs[0]],
      wcsId: wcsIdLBracketRod,
    },
    mate2: {
      matePath: [rodAsmRef as number],
      wcsId: wscIdRodLeft,
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
