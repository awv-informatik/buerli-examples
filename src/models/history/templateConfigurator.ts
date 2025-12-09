/* eslint-disable @typescript-eslint/no-unused-vars */
import { Create, Param, Update, storeApi } from '../../store'

// Example for a global module variable to show how it has to be reset if you need such variables
let globalVariable: any = 0

export const paramsMap: Param[] = [
  // number example
  // { index: 0, name: 'test', type: ParamType.Number, value: 60 },
  // string example
  // { index: 1, name: 'test', type: ParamType.Enum, value: 't1', values: ['t2', 't3', 't4'] },
  // slider example
  // { index: 2, name: 'test', type: ParamType.Slider, value: 6, step: 1, values: [2, 12] },
].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  // If you have global module variables, they have to be reset here
  globalVariable = 0

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Start updating your model here...
  // ...
  // ...

  return 0 // product id
}

export default { create, update, paramsMap }
