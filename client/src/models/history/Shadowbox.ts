import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/ShadowboxTemplate.ofb'
import { Create, Param, ParamType, storeApi, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Depth', type: ParamType.Number, value: 20 },
  { index: 1, name: 'Height', type: ParamType.Number, value: 200 },
  { index: 2, name: 'Width', type: ParamType.Number, value: 400 },
  { index: 3, name: 'Min. Gap', type: ParamType.Number, value: 5 },
  { index: 4, name: 'Hole Diameter', type: ParamType.Number, value: 35 },
  { index: 5, name: 'Columns', type: ParamType.Number, value: 8 },
  { index: 6, name: 'Rows', type: ParamType.Number, value: 4 },

  // string example
  // { index: 6, name: 'test', type: 'enum', value: 't1', values: ['t2', 't3', 't4'] },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }

  const productId = await api.load(arraybuffer, 'ofb')

  // Set initial values
  const minGap = params.values[3]
  const holeDiameter = params.values[4]
  let columns = params.values[5]
  let rows = params.values[6]
  const foamDepth = params.values[0]
  const foamHeight = params.values[1]
  const foamWidth = params.values[2]

  // Calculate max. columns and rows
  columns =
    foamWidth - columns * holeDiameter >= (columns + 1) * minGap
      ? columns
      : Math.floor((foamWidth - (columns + 1) * minGap) / holeDiameter)

  rows =
    foamHeight - rows * holeDiameter >= (rows + 1) * minGap
      ? rows
      : Math.floor((foamHeight - (rows + 1) * minGap) / holeDiameter)

  await api.setExpressions(
    productId[0],
    { name: 'Columns', value: columns },
    { name: 'Rows', value: rows },
    { name: 'HoleDiameter', value: holeDiameter },
    { name: 'FoamDepth', value: foamDepth },
    { name: 'FoamHeight', value: foamHeight },
    { name: 'FoamWidth', value: foamWidth },
  )
  return productId[0]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory

  const minGap = params.values[3]
  const holeDiameter = params.values[4]
  let columns = params.values[5]
  let rows = params.values[6]
  const foamDepth = params.values[0]
  const foamHeight = params.values[1]
  const foamWidth = params.values[2]

  // Calculate max. columns and rows
  columns =
    foamWidth - columns * holeDiameter >= (columns + 1) * minGap
      ? columns
      : Math.floor((foamWidth - (columns + 1) * minGap) / holeDiameter)

  rows =
    foamHeight - rows * holeDiameter >= (rows + 1) * minGap
      ? rows
      : Math.floor((foamHeight - (rows + 1) * minGap) / holeDiameter)

  api.setExpressions(
    productId,
    { name: 'Columns', value: columns },
    { name: 'Rows', value: rows },
    { name: 'HoleDiameter', value: holeDiameter },
    { name: 'FoamDepth', value: foamDepth },
    { name: 'FoamHeight', value: foamHeight },
    { name: 'FoamWidth', value: foamWidth },
  )
  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }
