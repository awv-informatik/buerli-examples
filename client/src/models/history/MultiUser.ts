import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/Flange/FlangePrt.of1'
import { Create, Param, ParamType, storeApi, Update } from '../../store'
import { useStore } from './MultiUser_Helper'

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
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex
  const setHolesCount = useStore(state => state.setHolesCount)

  if (check(paramsMap[0])) {
    setHolesCount(params.values[0])
    await api.setExpressions(productId, { name: 'holeCount', value: params.values[0] })
  }

  if (check(paramsMap[1])) {
    await api.setExpressions(productId, { name: 'flangeHeight', value: params.values[1] })
  }

  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }
