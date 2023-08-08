/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history } from '@buerli.io/headless'
import { Param, Create } from '../../store'
import sketches from '../../resources/history/SuspensionBracket.ofb?buffer'
import {
  BooleanOperationType,
  ExtrusionType,
  WorkPlaneType,
} from '@buerli.io/classcad'
import { GraphicType } from '@buerli.io/core'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params, options) => {
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
  await api.loadSketch(part, sketches, wp)
  const sROuter = await api.getSketchRegion(part, 'Outer')
  const sRHoles = await api.getSketchRegion(part, 'Holes')
  const sRInner = await api.getSketchRegion(part, 'Inner')
  const extrOuter = await api.extrusion(
    part,
    sROuter,
    ExtrusionType.SYMMETRIC,
    0,
    20,
    0,
    { x: 0, y: 0, z: 1 },
    1,
  )
  const extrHoles = await api.extrusion(
    part,
    sRHoles,
    ExtrusionType.SYMMETRIC,
    0,
    15,
    0,
    { x: 0, y: 0, z: 1 },
    1,
  )
  const extrInner = await api.extrusion(
    part,
    sRInner,
    ExtrusionType.SYMMETRIC,
    0,
    10,
    0,
    { x: 0, y: 0, z: 1 },
    1,
  )
  await api.boolean(part, BooleanOperationType.UNION, [extrHoles, extrOuter, extrInner])

  // The following position have been found by selecting two loops
  const positions = [
    [{ x: 20.667, y: 7.541, z: -5 }],
    [{ x: 63.589, y: 59.078, z: -5 }],
    [{ x: 125.084, y: 93.726, z: -5 }],
    [{ x: 152.271, y: 60.765, z: -5 }],
    [{ x: 138.257, y: 16.007, z: -5 }],
    [{ x: 78.329, y: -7.181, z: -5 }],
    [{ x: 71.155, y: 52.334, z: -5 }],
    [{ x: 28.016, y: 20.318, z: -5 }],
    [{ x: 30.135, y: 10.764, z: -5 }],
    [{ x: 34.482, y: 2.075, z: -5 }],
    [{ x: 77.201, y: 2.849, z: -5 }],
    [{ x: 120.19, y: 0.525, z: -5 }],
    [{ x: 130.441, y: 22.254, z: -5 }],
    [{ x: 148.445, y: 37.99, z: -5 }],
    [{ x: 141.904, y: 60.146, z: -5 }],
    [{ x: 134.465, y: 81.217, z: -5 }],
    [{ x: 122.58, y: 84.04, z: -5 }],
    [{ x: 110.825, y: 87.901, z: -5 }],
    [{ x: 20.667, y: 7.541, z: 5 }],
    [{ x: 78.329, y: -7.181, z: 5 }],
    [{ x: 138.257, y: 16.007, z: 5 }],
    [{ x: 152.271, y: 60.765, z: 5 }],
    [{ x: 125.084, y: 93.726, z: 5 }],
    [{ x: 63.589, y: 59.078, z: 5 }],
    [{ x: 71.155, y: 52.334, z: 5 }],
    [{ x: 110.825, y: 87.901, z: 5 }],
    [{ x: 122.58, y: 84.04, z: 5 }],
    [{ x: 134.465, y: 81.217, z: 5 }],
    [{ x: 141.904, y: 60.146, z: 5 }],
    [{ x: 148.445, y: 37.99, z: 5 }],
    [{ x: 130.441, y: 22.254, z: 5 }],
    [{ x: 120.19, y: 0.525, z: 5 }],
    [{ x: 77.201, y: 2.849, z: 5 }],
    [{ x: 34.482, y: 2.075, z: 5 }],
    [{ x: 30.135, y: 10.764, z: 5 }],
    [{ x: 28.016, y: 20.318, z: 5 }],
  ]
  const edges = await api.findGeometry(part, GraphicType.ARC, positions)
  await api.fillet(part, edges, 1)

  return part
}

export const cad = new history()

export default { create, paramsMap, cad }
