import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/Flange/FlangePrt.of1'
import { Create, Param, storeApi, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Holes Count', type: 'slider', value: 6, values: [2, 12] },
  { index: 1, name: 'Flange Height', type: 'slider', value: 100, values: [40, 300] },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const productId = await api.load(arraybuffer, 'of1')

  // Set initial values
  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  await api.setExpressions(
    productId[0],
    { name: 'holeCount', value: holesCount },
    { name: 'flangeHeight', value: flangeHeight },
  )
  return productId[0]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory

  const holesCount = params.values[0]
  const flangeHeight = params.values[1]

  api.setExpressions(
    productId,
    { name: 'holeCount', value: holesCount },
    { name: 'flangeHeight', value: flangeHeight },
  )
  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }
