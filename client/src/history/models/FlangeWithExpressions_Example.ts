import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/FlangeV2.of1'
import { ParamType } from '../store'

export const paramsMap: ParamType = {
  'Flange Depth': 20,
  'Inner Radius': 100,
}

export const create = async (api: ApiHistory, params: ParamType = paramsMap) => {
  const productId = await api.load(arraybuffer, 'of1')

  // Set initial values
  const flanschdicke = params['Flange Depth']
  const innenradius = params['Inner Radius']
  const anzahlBohrungen = Math.ceil(innenradius / 10) >= 3 ? Math.ceil(innenradius / 10) : 3

  await api.setExpressions(
    productId[0],
    { name: 'AnzahlBohrungen', value: anzahlBohrungen },
    { name: 'Flanschdicke', value: flanschdicke },
    { name: 'Innenradius', value: innenradius },
  )
  return productId[0]
}

export const update = async (api: ApiHistory, productId: number, params: ParamType = paramsMap) => {
  const flanschdicke = params['Flange Depth']
  const innenradius = params['Inner Radius']
  const anzahlBohrungen = Math.ceil(innenradius / 10) >= 3 ? Math.ceil(innenradius / 10) : 3

  await api.setExpressions(
    productId,
    { name: 'AnzahlBohrungen', value: anzahlBohrungen },
    { name: 'Flanschdicke', value: flanschdicke },
    { name: 'Innenradius', value: innenradius },
  )

  return productId
}

export default create
