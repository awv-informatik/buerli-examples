import { ApiHistory } from '@buerli.io/headless'
import { ParamType } from '../store'

export const create = async (api: ApiHistory, params?: ParamType) => {
  const part = api.createPart('Part')
  api.cylinder(part, [], 10, 100)
  const topEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 100 }])
  api.fillet(part, topEdges, 2)
  return part
}

export default create
