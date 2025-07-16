import { Buffer } from 'buffer'
import arraybuffer from '../../resources/history/GripperTemplate.ofb?buffer'
import { Create, Param, ParamType, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Width', type: ParamType.Number, value: 60 },
  { index: 1, name: 'Height', type: ParamType.Number, value: 170 },
  { index: 2, name: 'Distance', type: ParamType.Number, value: 40 },
  { index: 3, name: 'Taper', type: ParamType.Number, value: 50 },
].sort((a, b) => a.index - b.index)

const data = Buffer.from(arraybuffer).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const { part: partApi, common: commonApi } = model.api.v1

  const { id: productId } = await commonApi.load({ data: data, format: 'ofb', ident: 'root', encoding: 'base64' })

  // Set initial values
  await partApi.updateExpression({
    id: productId,
    toUpdate: [
      { name: 'W', value: params.values[0] },
      { name: 'H', value: params.values[1] },
      { name: 'D', value: params.values[2] },
      { name: 'W1', value: params.values[3] },
    ],
  })
  return productId
}

export const update: Update = async (model, productId, params) => {
  const { part: partApi } = model.api.v1

  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    await partApi.updateExpression({
      id: productId,
      toUpdate: [{ name: 'W', value: params.values[0] }],
    })
  }

  if (check(paramsMap[1])) {
    await partApi.updateExpression({
      id: productId,
      toUpdate: [{ name: 'H', value: params.values[1] }],
    })
  }

  if (check(paramsMap[2])) {
    await partApi.updateExpression({
      id: productId,
      toUpdate: [{ name: 'D', value: params.values[2] }],
    })
  }

  if (check(paramsMap[3])) {
    await partApi.updateExpression({
      id: productId,
      toUpdate: [{ name: 'W1', value: params.values[3] }],
    })
  }

  return productId
}

export default { update, create, paramsMap }
