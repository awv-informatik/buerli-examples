import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/Flange/FlangePrt.ofb'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Holes Count', type: ParamType.Slider, value: 6, step: 1, values: [2, 12] },
  {
    index: 1,
    name: 'Flange Height',
    type: ParamType.Slider,
    value: 100,
    step: 5,
    values: [40, 300],
  },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const productId = await api.load(arraybuffer, 'ofb')

  // Set initial values
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  await api.setExpressions({
    partId: productId[0],
    members: [
      { name: 'holeCount', value: holesCount },
      { name: 'flangeHeight', value: flangeHeight },
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
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  api.setExpressions({
    partId: productId,
    members: [
      { name: 'holeCount', value: holesCount },
      { name: 'flangeHeight', value: flangeHeight },
    ],
  })
  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }
