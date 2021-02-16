import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/gripperV2.of1'
import { ParamType } from '../store'

export const paramsMap: ParamType = {
  Width: 60,
  Height: 150,
  Distance: 20,
  Taper: 50,
}

export const create = async (api: ApiHistory, params: ParamType = paramsMap) => {
  const file = new File(['gripperV2.of1'], 'gripperV2.of1', {
    type: 'application/x-binary',
  })
  const productId = await api.loadFile(file, arraybuffer)

  // Set initial values
  await api.setExpressions(
    productId,
    { name: 'W', value: params['Width'] },
    { name: 'H', value: params['Height'] },
    { name: 'D', value: params['Distance'] },
    { name: 'W1', value: params['Taper'] },
  )
  return productId
}

export const update = async (api: ApiHistory, productId: number, params: ParamType = paramsMap) => {
  await api.setExpressions(
    productId,
    { name: 'W', value: params['Width'] },
    { name: 'H', value: params['Height'] },
    { name: 'D', value: params['Distance'] },
    { name: 'W1', value: params['Taper'] },
  )
}

export default create
