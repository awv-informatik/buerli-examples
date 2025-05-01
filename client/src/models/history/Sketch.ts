/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'
import sketches from '../../resources/history/SketchesTemplate.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)
const data = Buffer.from(sketches).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params) => {
  const api = model.api.v1
  const { result: part } = await api.part.create({ name: 'Part' })
  const { result: wp } = await api.part.workPlane({ id: part, normal: { x: 0, y: 0, z: 1 }, name: 'WP' })
  const { result: sketch } = await api.sketch.create({ id: part, planeId: wp })
  await api.sketch.loadFrom({ id: sketch, partId: part, data, format: 'OFB', encoding: 'base64' })
  await api.part.extrusion({ id: part, type: 'UP', references: [sketch], limit2: 20 })
  return part
}

export default { create, paramsMap }
