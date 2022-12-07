/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history } from '@buerli.io/headless'
import { Param, Create } from '../../store'
import sketches from '../../resources/history/SketchesTemplate.ofb'
import { ExtrusionType, WorkAxisType, WorkPlaneType } from '@buerli.io/classcad'

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
  const axis = api.createWorkAxis(
    part,
    WorkAxisType.WA_USERDEFINED,
    [],
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    false,
    'WA',
  )
  const sketch = await api.loadSketch(part, sketches, wp)
  const sketch2 = await api.copySketch(part, sketch, wp)
  const sketchRegions = await api.getSketchRegion(part)
  //await api.extrusion(part, sketchRegions, ExtrusionType.UP, 0, 20, 0, { x: 0, y: 0, z: 1 }, 1)
  await api.revolve(part, sketchRegions, [axis], 0, 360, 0)

  return part
}

export const cad = new history()

export default { create, paramsMap, cad }
