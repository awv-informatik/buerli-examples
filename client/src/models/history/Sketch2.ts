/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'
import sketches from '../../resources/history/SuspensionBracket.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const data = Buffer.from(sketches).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params, options) => {
  const { sketch: sketchApi, part: partApi } = model.api.v1

  const part = await partApi.create({ name: 'Part' })
  const wp = await partApi.workPlane({
    id: part,
    normal: { x: 0, y: 0, z: 1 },
    name: 'WP',
  })
  const sketch = await sketchApi.create({ id: part, planeId: wp })
  await sketchApi.loadFrom({ id: sketch, partId: part, data, format: 'OFB', encoding: 'base64' })
  const sROuter = await sketchApi.getSketchRegion({ id: sketch, name: 'Outer' })
  const sRHoles = await sketchApi.getSketchRegion({ id: sketch, name: 'Holes' })
  const sRInner = await sketchApi.getSketchRegion({ id: sketch, name: 'Inner' })
  const extrOuter = await partApi.extrusion({
    id: part,
    references: [sROuter],
    type: 'SYMMETRIC',
    limit2: 20,
  })
  const extrHoles = await partApi.extrusion({
    id: part,
    references: [sRHoles],
    type: 'SYMMETRIC',
    limit2: 15,
  })
  const extrInner = await partApi.extrusion({
    id: part,
    references: [sRInner],
    type: 'SYMMETRIC',
    limit2: 10,
  })
  await partApi.boolean({
    id: part,
    type: 'UNION',
    target: { id: extrHoles },
    tools: [extrOuter, extrInner],
  })

  // The following position have been found by selecting two loops
  const positions = [
    { pos: { x: 20.667, y: 7.541, z: -5 } },
    { pos: { x: 63.589, y: 59.078, z: -5 } },
    { pos: { x: 125.084, y: 93.726, z: -5 } },
    { pos: { x: 152.271, y: 60.765, z: -5 } },
    { pos: { x: 138.257, y: 16.007, z: -5 } },
    { pos: { x: 78.329, y: -7.181, z: -5 } },
    { pos: { x: 71.155, y: 52.334, z: -5 } },
    { pos: { x: 28.016, y: 20.318, z: -5 } },
    { pos: { x: 30.135, y: 10.764, z: -5 } },
    { pos: { x: 34.482, y: 2.075, z: -5 } },
    { pos: { x: 77.201, y: 2.849, z: -5 } },
    { pos: { x: 120.19, y: 0.525, z: -5 } },
    { pos: { x: 130.441, y: 22.254, z: -5 } },
    { pos: { x: 148.445, y: 37.99, z: -5 } },
    { pos: { x: 141.904, y: 60.146, z: -5 } },
    { pos: { x: 134.465, y: 81.217, z: -5 } },
    { pos: { x: 122.58, y: 84.04, z: -5 } },
    { pos: { x: 110.825, y: 87.901, z: -5 } },
    { pos: { x: 20.667, y: 7.541, z: 5 } },
    { pos: { x: 78.329, y: -7.181, z: 5 } },
    { pos: { x: 138.257, y: 16.007, z: 5 } },
    { pos: { x: 152.271, y: 60.765, z: 5 } },
    { pos: { x: 125.084, y: 93.726, z: 5 } },
    { pos: { x: 63.589, y: 59.078, z: 5 } },
    { pos: { x: 71.155, y: 52.334, z: 5 } },
    { pos: { x: 110.825, y: 87.901, z: 5 } },
    { pos: { x: 122.58, y: 84.04, z: 5 } },
    { pos: { x: 134.465, y: 81.217, z: 5 } },
    { pos: { x: 141.904, y: 60.146, z: 5 } },
    { pos: { x: 148.445, y: 37.99, z: 5 } },
    { pos: { x: 130.441, y: 22.254, z: 5 } },
    { pos: { x: 120.19, y: 0.525, z: 5 } },
    { pos: { x: 77.201, y: 2.849, z: 5 } },
    { pos: { x: 34.482, y: 2.075, z: 5 } },
    { pos: { x: 30.135, y: 10.764, z: 5 } },
    { pos: { x: 28.016, y: 20.318, z: 5 } },
  ]
  const edges = (await partApi.getGeometryIds({ id: part, arcs: positions })).arcs
  await partApi.fillet({ id: part, references: edges, radius: 1 })

  return part
}

export default { create, paramsMap }
