import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/Flange.of1'
import { ParamType } from '../store'

export const paramsMap: ParamType = {
  'Flange Depth': 20,
  'Inner Radius': 100,
}

export const create = async (api: ApiHistory, params?: ParamType) => {
  const file = new File(['Flange.of1'], 'Flange.of1', { type: 'application/x-binary' })
  const productId = await api.loadFile(file, arraybuffer)

  // Set initial values
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

export const update = async (api: ApiHistory, productId: number, params?: ParamType) => {
  const flanschdicke = params['Flange Depth']
  const innenradius = params['Inner Radius']
  const anzahlBohrungen = Math.ceil(innenradius / 10) >= 3 ? Math.ceil(innenradius / 10) : 3

  api.setExpressions(
    productId,
    { name: 'AnzahlBohrungen', value: anzahlBohrungen },
    { name: 'Flanschdicke', value: flanschdicke },
    { name: 'Innenradius', value: innenradius },
  )
}

export default create
