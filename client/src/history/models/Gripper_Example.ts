import { ApiHistory } from '@buerli.io/headless'
//import * as THREE from 'three'
import arraybuffer from '../../shared/resources/gripperV2.of1'
import { ParamType } from '../store'

export const paramsMap: ParamType = {
  Width: 60,
  Height: 150,
  Distance: 20,
  Taper: 50,
}

export const create = async (api: ApiHistory, params?: ParamType) => {
  const file = new File(['gripperV2.of1'], 'gripperV2.of1', {
    type: 'application/x-binary',
  })
  return await api.loadFile(file, arraybuffer)
}

export const update = async (api: ApiHistory, partId: number, params?: ParamType) => {
  await api.setExpressions(
    partId,
    { name: 'W', value: params['Width'] },
    { name: 'H', value: params['Height'] },
    { name: 'D', value: params['Distance'] },
    { name: 'W1', value: params['Taper'] },
  )
}

export default create
