import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/gripperV2.of1'
import { Create, ParamType } from '../../store'

export const params: ParamType = {
  Width: 60,
  Height: 150,
  Distance: 20,
  Taper: 50,
}

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const productId = await api.load(arraybuffer, 'of1')

  // Set initial values
  await api.setExpressions(
    productId[0],
    { name: 'W', value: params['Width'] },
    { name: 'H', value: params['Height'] },
    { name: 'D', value: params['Distance'] },
    { name: 'W1', value: params['Taper'] },
  )
  return productId[0]
}

export const update = async (api: ApiHistory, productId: number, params: ParamType) => {
  await api.setExpressions(
    productId,
    { name: 'W', value: params['Width'] },
    { name: 'H', value: params['Height'] },
    { name: 'D', value: params['Distance'] },
    { name: 'W1', value: params['Taper'] },
  )
}

export const cad = new history()

export default { update, create, params, cad }
