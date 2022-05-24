import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/ShadowboxV2.of1'
import { ParamType } from '../store'

export const paramsMap: ParamType = {
  Depth: 20,
  Height: 200,
  Width: 400,
  'Min. Gap': 5,
  'Hole Diameter': 35,
  Columns: 8,
  Rows: 4,
}

export const create = async (api: ApiHistory, params: ParamType = paramsMap) => {
  const productId = await api.load(arraybuffer, 'of1')

  // Set initial values
  const minGap = params['Min. Gap']
  const holeDiameter = params['Hole Diameter']
  let columns = params['Columns']
  let rows = params['Rows']
  const foamDepth = params['Depth']
  const foamHeight = params['Height']
  const foamWidth = params['Width']

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

export const update = async (api: ApiHistory, productId: number, params: ParamType = paramsMap) => {
  const minGap = params['Min. Gap']
  const holeDiameter = params['Hole Diameter']
  let columns = params['Columns']
  let rows = params['Rows']
  const foamDepth = params['Depth']
  const foamHeight = params['Height']
  const foamWidth = params['Width']

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
}

export default create
