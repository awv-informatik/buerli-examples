import { ApiHistory } from '@buerli.io/headless'
import { ParamType } from '../store'

export const create = async (api: ApiHistory, params?: ParamType) => {
  const part = await api.createPart('Part')
  const wcs = await api.createWorkCoordSystem(
    part,
    'Custom',
    [],
    [],
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    0,
    false,
    'wcs',
  )
  await api.cylinder(part, [wcs], 10, 100)
  const topEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 100 }])
  await api.fillet(part, topEdges, 2)
  return part
}

export default create
