import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/GripperTemplate.ofb'
import { Create, Param, ParamType, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Width', type: ParamType.Number, value: 60 },
  { index: 1, name: 'Height', type: ParamType.Number, value: 170 },
  { index: 2, name: 'Distance', type: ParamType.Number, value: 40 },
  { index: 3, name: 'Taper', type: ParamType.Number, value: 50 },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const productId = await api.load(arraybuffer, 'ofb')

  // Set initial values
  await api.setExpressions({
    partId: productId[0],
    members: [
      { name: 'W', value: params.values[0] },
      { name: 'H', value: params.values[1] },
      { name: 'D', value: params.values[2] },
      { name: 'W1', value: params.values[3] },
    ],
  })
  return productId[0]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    throw new Error(
      'Calling update does not support multiple product ids. Use a single product id only.',
    )
  }
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    await api.setExpressions({
      partId: productId,
      members: [{ name: 'W', value: params.values[0] }],
    })
  }

  if (check(paramsMap[1])) {
    await api.setExpressions({
      partId: productId,
      members: [{ name: 'H', value: params.values[1] }],
    })
  }

  if (check(paramsMap[2])) {
    await api.setExpressions({
      partId: productId,
      members: [{ name: 'D', value: params.values[2] }],
    })
  }

  if (check(paramsMap[3])) {
    await api.setExpressions({
      partId: productId,
      members: [{ name: 'W1', value: params.values[3] }],
    })
  }

  return productId
}

export const cad = new history()

export default { update, create, paramsMap, cad }
