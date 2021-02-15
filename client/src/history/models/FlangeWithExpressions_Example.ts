import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/Flange.of1'
import { ParamType } from '../store'

export const paramsMap: ParamType = {
  'Flange Depth': 20,
  'Inner Radius': 100,
}

export const create = async (api: ApiHistory, params?: ParamType) => {
  const file = new File(['Flange.of1'], 'Flange.of1', { type: 'application/x-binary' })
  return await api.loadFile(file, arraybuffer)
}

export const update = async (api: ApiHistory, partId: number, params?: ParamType) => {
  const flanschdicke = params['Flange Depth']
  const innenradius = params['Inner Radius']
  const anzahlBohrungen = Math.ceil(innenradius / 10) >= 3 ? Math.ceil(innenradius / 10) : 3

  api.setExpressions(
    partId,
    { name: 'AnzahlBohrungen', value: anzahlBohrungen },
    { name: 'Flanschdicke', value: flanschdicke },
    { name: 'Innenradius', value: innenradius },
  )
}

export default create
