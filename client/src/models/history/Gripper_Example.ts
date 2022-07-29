import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/gripperV2.of1'
import { Create, Param, storeApi, Update, useStore } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Width', type: 'number', value: 60 },
  { index: 1, name: 'Height', type: 'number', value: 170 },
  { index: 2, name: 'Distance', type: 'number', value: 40 },
  { index: 3, name: 'Taper', type: 'number', value: 50 },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const productId = await api.load(arraybuffer, 'of1')

  // Set initial values
  await api.setExpressions(
    productId[0],
    { name: 'W', value: params[0] },
    { name: 'H', value: params[1] },
    { name: 'D', value: params[2] },
    { name: 'W1', value: params[3] },
  )
  return productId[0]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory

  await api.setExpressions(
    productId,
    { name: 'W', value: params.values[0] },
    { name: 'H', value: params.values[1] },
    { name: 'D', value: params.values[2] },
    { name: 'W1', value: params.values[3] },
  )
}

export const cad = new history()

export default { update, create, paramsMap, cad }