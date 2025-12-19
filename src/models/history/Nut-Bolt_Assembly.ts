import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)
const nutData = arraybuffer2
const boltData = arraybuffer

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1

  const shaftDiameter = 10
  const shaftLength = 37
  const nutBoltAsm = await assemblyApi.create({ name: 'NutBolt_Asm' })

  /* Bolt */
  const { id: bolt } = await assemblyApi.loadProduct({ data: boltData, format: 'OFB' })

  await partApi.updateExpression({
    id: bolt,
    toUpdate: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })
  const boltRefId = await assemblyApi.instance({
    productId: bolt,
    ownerId: nutBoltAsm,
  })

  const wcsIdBoltNut = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Nut' })
  const wcsIdOrigin = await partApi.getWorkGeometry({ id: boltRefId as number, name: 'WCS_Origin' })

  /* Nut */
  const { id: nut } = await assemblyApi.loadProduct({ data: nutData, format: 'OFB' })

  await partApi.updateExpression({
    id: nut,
    toUpdate: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })
  const nutRefId = await assemblyApi.instance({
    productId: nut,
    ownerId: nutBoltAsm,
  })
  const wcsIdNut = await partApi.getWorkGeometry({ id: nutRefId as number, name: 'WCS_Hole_Top' })

  /* Bolt at origin */
  await assemblyApi.fastenedOrigin({
    id: nutBoltAsm,
    mate1: {
      path: [boltRefId as number],
      csys: wcsIdOrigin,
    },
    name: 'FOC0',
  })

  /* Nut on Bolt */
  await assemblyApi.fastened({
    id: nutBoltAsm,
    mate1: {
      path: [nutRefId as number],
      csys: wcsIdNut,
    },
    mate2: {
      path: [boltRefId as number],
      csys: wcsIdBoltNut,
    },
    name: 'FC1',
  })
  return nutBoltAsm
}

export default { create, paramsMap }
