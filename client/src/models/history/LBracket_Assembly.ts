import { ClassCAD } from '@buerli.io/classcad'
import { Buffer } from 'buffer'
import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer3 from '../../resources/history/As1/LBracket.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const boltData = Buffer.from(arraybuffer).toString('base64') // TODO: how to support ArrayBuffer in the API?
const lBracketData = Buffer.from(arraybuffer3).toString('base64') // TODO: how to support ArrayBuffer in the API?
const nutData = Buffer.from(arraybuffer2).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { part: partApi, assembly: assemblyApi } = model.api.v1

  const shaftDiameter = 10
  const shaftLength = 37
  const rodDiameter = 10

  const { result: lBracketAsm } = await assemblyApi.create({ name: 'LBracket_Asm' })
  const { result: nutBoltAsm } = await assemblyApi.assemblyTemplate({ name: 'NutBolt_Asm' })

  /* Bolt */
  const {
    result: { id: bolt },
  } = await assemblyApi.loadProduct({ data: boltData, format: 'OFB', encoding: 'base64' })

  await partApi.updateExpression({
    id: bolt,
    toUpdate: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })
  const { result: boltRefId } = await assemblyApi.instance({
    productId: bolt,
    ownerId: nutBoltAsm,
  })

  const { result: wcsIdBoltNut } = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Nut' })
  const { result: wcsIdBoltHeadShaft } = await partApi.getWorkGeometry({
    id: boltRefId as number,
    name: 'WCS_Head-Shaft',
  })
  const { result: wcsIdBoltOrigin } = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Origin' })

  /* Nut */
  const {
    result: { id: nut },
  } = await assemblyApi.loadProduct({ data: nutData, format: 'OFB', encoding: 'base64' })

  await partApi.updateExpression({
    id: nut,
    toUpdate: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  const { result: nutRefId } = await assemblyApi.instance({
    productId: nut,
    ownerId: nutBoltAsm,
  })
  const { result: wcsIdNut } = await partApi.getWorkGeometry({ id: nutRefId as number, name: 'WCS_Hole_Top' })

  /* Set bolt to origin of nut-bolt-assembly */
  await assemblyApi.fastenedOrigin({
    id: nutBoltAsm,
    mate1: {
      path: [boltRefId as number],
      csys: wcsIdBoltOrigin,
    },
    name: 'FOC0',
  })

  /* Nut on Bolt */
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

  /* LBracket */
  const {
    result: { id: lBracket },
  } = await assemblyApi.loadProduct({ data: lBracketData, format: 'OFB', encoding: 'base64' })

  await partApi.updateExpression({
    id: lBracket,
    toUpdate: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  const { result: lBracketRef1 } = await assemblyApi.instance({
    productId: lBracket,
    ownerId: lBracketAsm,
  })

  const { result: wcsIdLBracketOrigin } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Origin',
  })
  const { result: wcsIdLBracket1 } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole1-Top',
  })
  const { result: wcsIdLBracket2Top } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole2-Top',
  })
  const { result: wcsIdLBracket3 } = await partApi.getWorkGeometry({
    id: lBracketRef1 as number,
    name: 'WCS_Hole3-Top',
  })

  /* LBracket at origin */
  await assemblyApi.fastenedOrigin({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracketOrigin,
    },
    name: 'FOC',
  })

  const res = await assemblyApi.instance([
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
  const [nutBoltAsmRef1, nutBoltAsmRef2, nutBoltAsmRef3] = res.result as number[]

  /* NutBoltAsm on LBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracket1,
    },
    mate2: {
      path: [nutBoltAsmRef1 as number],
      csys: wcsIdBoltHeadShaft,
    },
    name: 'FC2',
  })

  /* NutBoltAsm on LBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracket2Top,
    },
    mate2: {
      path: [nutBoltAsmRef2 as number],
      csys: wcsIdBoltHeadShaft,
    },
    name: 'FC3',
  })

  /* NutBoltAsm on LBracket */
  await assemblyApi.fastened({
    id: lBracketAsm,
    mate1: {
      path: [lBracketRef1 as number],
      csys: wcsIdLBracket3,
    },
    mate2: {
      path: [nutBoltAsmRef3 as number],
      csys: wcsIdBoltHeadShaft,
    },
    name: 'FC4',
  })
  return lBracketAsm
}

export const getScene = async (model: ClassCAD, productId: number) => {
  if (!model) return
  const { scene } = await model.createScene(productId, { meshPerGeometry: false })
  console.info(scene)
  return scene
}

export default { create, paramsMap }
