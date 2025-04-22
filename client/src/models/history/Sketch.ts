/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'
import sketches from '../../resources/history/SketchesTemplate.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  const { sketch: sketchApi, part: partApi } = model.api
  const { result: part } = await partApi.create({ name: 'Part' })
  const { result: wp } = await partApi.workPlane({
    id: part,
    type: 'USERDEFINED',
    references: [],
    offset: 0,
    angle: 0,
    position: [0, 0, 0],
    normal: [0, 0, 1],
    name: 'WP',
  })
  const { result: sketch } = await sketchApi.create({ id: part, planeId: wp })
  await sketchApi.loadFrom({
    id: sketch,
    partId: part,
    data: Buffer.from(sketches).toString('utf-8'), // TODO: how to support ArrayBuffer in the API?
    format: 'OFB',
  })
  await partApi.extrusion({
    id: part,
    type: 'UP',
    references: [sketch],
    limit1: 0,
    limit2: 20,
    taperAngle: 0,
    direction: [0, 0, 1],
    capEnds: true,
  })
  return part
}

export default { create, paramsMap }
