import { History } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import { Create, Param } from '../../store'
import { Buffer } from 'buffer'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)
const nutData = Buffer.from(arraybuffer2).toString('utf-8') // TODO: how to support ArrayBuffer in the API?

const boltData = Buffer.from(arraybuffer).toString('utf-8') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1

  const shaftDiameter = 10
  const shaftLength = 37
  const { result: nutBoltAsm } = await assemblyApi.create({ name: 'NutBolt_Asm' })

  /* Bolt */
  const { result: { id: bolt } } = await assemblyApi.loadProduct({ data: boltData, format: 'OFB' })

  await partApi.updateExpression({
    id: bolt,
    toUpdate: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ]
  })
  const { result: boltRefId } = await assemblyApi.instance({
    productId: bolt,
    ownerId: nutBoltAsm
  })

  const { result: wcsIdBoltNut } = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Nut' })
  const { result: wcsIdOrigin } = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Origin' })

  /* Nut */
  const { result: { id: nut } } = await assemblyApi.loadProduct({ data: nutData, format: 'OFB' })
  
  await partApi.updateExpression({
    id: nut,
    toUpdate: [
      { name: 'Hole_Diameter', value: shaftDiameter }
    ]
  })
  const { result: nutRefId } = await assemblyApi.instance({
    productId: nut,
    ownerId: nutBoltAsm
  })
  const { result: wcsIdNut } = await partApi.getWorkGeometry({ id: nutRefId as number, name: 'WCS_Hole_Top' })

  /* Bolt at origin */
  await assemblyApi.fastenedOrigin({
    id: nutBoltAsm,
    mate1: {
      matePath: [boltRefId as number],
      wcsId: wcsIdOrigin,
    },
    name: 'FOC0'
  })

  /* Nut on Bolt */
  await assemblyApi.fastened({
    id: nutBoltAsm,
    mate1: {
      matePath: [nutRefId as number],
      wcsId: wcsIdNut,
    },
    mate2: {
      matePath: [boltRefId as number],
      wcsId: wcsIdBoltNut,
    },
    name: 'FC1'
  })
  return nutBoltAsm
}

export const cad = new History()

export default { create, paramsMap, cad }
