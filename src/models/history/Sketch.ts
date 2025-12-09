/* eslint-disable @typescript-eslint/no-unused-vars */
import sketches from '../../resources/history/SketchesTemplate.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)
const data = sketches

export const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create({ name: 'Part' })
  const wp = await api.part.workPlane({ id: part, normal: { x: 0, y: 0, z: 1 }, name: 'WP' })
  const sketch = await api.sketch.create({ id: part, planeId: wp })
  await api.sketch.loadFrom({ id: sketch, partId: part, data, format: 'OFB' })
  await api.part.extrusion({ id: part, type: 'UP', references: [sketch], limit2: 20 })
  return part
}

export default { create, paramsMap }
