/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history } from '@buerli.io/headless'
import { Param, Create } from '../../store'
import sketches from '../../resources/history/SketchesTemplate.ofb?buffer'
import { ExtrusionType, WorkPlaneType } from '@buerli.io/classcad'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const part = api.createPart('Part')
  const wp = api.createWorkPlane(
    part,
    WorkPlaneType.WP_USERDEFINED,
    [],
    0,
    0,
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    false,
    'WP',
  )
  const sketch = await api.loadSketch(part, sketches, wp)
  await api.extrusion(part, sketch, ExtrusionType.UP, 0, 20, 0, { x: 0, y: 0, z: 1 }, 1)

  return part
}

export const cad = new history()

export default { create, paramsMap, cad }
