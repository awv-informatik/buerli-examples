import { ApiNoHistory, solid } from '@buerli.io/headless'
import { Param, Create, Update, storeApi } from '../../store'

export const paramsMap: Param[] = [
  // number example
  // { index: 0, name: 'Width', type: 'number', value: 60 },
  // string example
  // { section, index: 6, name: 'test', type: 'enum', value: 't1', values: ['t2', 't3', 't4'] },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  // Start creating your model here...
  // ...
  // ...

  return 0 // solid id
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiNoHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Start updating your model here...
  // ...
  // ...

  return 0 // solid id
}

export const cad = new solid()

export default { create, update, paramsMap, cad }
