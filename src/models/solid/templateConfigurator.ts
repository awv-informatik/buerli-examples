/* eslint-disable @typescript-eslint/no-unused-vars */
import { Create, Param, Update, storeApi } from '../../store'

const paramsMap: Param[] = [
  // number example
  // { index: 0, name: 'test', type: ParamType.Number, value: 60 },
  // string example
  // { index: 1, name: 'test', type: ParamType.Enum, value: 't1', values: ['t2', 't3', 't4'] },
  // slider example
  // { index: 2, name: 'test', type: ParamType.Slider, value: 6, step: 1, values: [2, 12] },
].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  // Start creating your model here...
  // ...
  // ...

  return [0] // solid ids
}

const update: Update = async (model, productId, params) => {
  const api = model.api.v1
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Start updating your model here...
  // ...
  // ...

  return [0] // solid ids
}

export default { create, update, paramsMap }
