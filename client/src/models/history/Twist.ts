/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, History } from '@buerli.io/headless'
import { Param, Create, ParamType, Update } from '../../store'
import arraybuffer from '../../resources/history/SketchRegionsTemplate.ofb?buffer'
import { ExtrusionType } from '@buerli.io/classcad'
import { ObjectID } from '@buerli.io/core'

let operation: ObjectID = 0

export const paramsMap: Param[] = [
  {
    index: 0,
    name: 'Options',
    type: ParamType.Dropdown,
    value: 'Sketch region "triangle" (Up)',
    values: [
      'Sketch region "triangle" (Up)',
      'Sketch region "rectangle" (Down without cap)',
      'Sketch region "moon" (Down)',
      'Sketch region "cross" (Custom limits)',
      'Sketch region "square" (Custom twist center)',
      'Composite curve (Custom limits)',
      'Sketch curves (Up)',
      'Sketch "0" (Up)',
      'Sketch "1" (Up)'
    ],
  },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params, options) => {
  const api = apiType as ApiHistory

  const [part] = await api.load(arraybuffer, 'ofb')

  await update(api, part, { lastUpdatedParam: undefined, values: params.values })

  return part
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    if (operation != 0) {
      await api.removeOperations([operation], undefined)
    }

    switch (params.values[0]) {
      case 'Sketch region "triangle" (Up)':
        const [sRTriangle] = await api.getSketchRegion(productId, 'Triangle')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sRTriangle,
          type: ExtrusionType.UP,
          limit1: 0,
          limit2: 100,
          twistAngle: Math.PI,
          capEnds: 1,
        })
        break

      case 'Sketch region "rectangle" (Down without cap)':
        const [sRRectangle] = await api.getSketchRegion(productId, 'Rectangle')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sRRectangle,
          type: ExtrusionType.DOWN,
          limit1: 0,
          limit2: 80,
          twistAngle: Math.PI / 2,
          capEnds: 0,
        })
        break

      case 'Sketch region "moon" (Down)':
        const [sRMoon] = await api.getSketchRegion(productId, 'Moon')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sRMoon,
          type: ExtrusionType.DOWN,
          limit1: 0,
          limit2: 60,
          twistAngle: 2 * Math.PI,
          capEnds: 1,
        })
        break

      case 'Sketch region "cross" (Custom limits)':
        const [sRCross] = await api.getSketchRegion(productId, 'Cross')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sRCross,
          type: ExtrusionType.UP,
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
          capEnds: 1,
        })
        break

      case 'Sketch region "square" (Custom twist center)':
        const [sRSquare] = await api.getSketchRegion(productId, 'Square')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sRSquare,
          type: ExtrusionType.CUSTOM,
          limit1: 0,
          limit2: 60,
          twistAngle: '180g',
          capEnds: 1,
          direction: { x: 0, y: 0, z: 1 },
          twistCenter: { x: 0, y: 0, z: 0 },
        })
        break

      case 'Composite curve (Custom limits)':
        const compCurve = await api.getFeatureByName(productId, 'Composite Curve')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: compCurve,
          type: ExtrusionType.UP,
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
          capEnds: 1,
        })
        break

      case 'Sketch "0" (Up)':
        const [sketch0] = await api.getSketch(productId, 'Sketch0')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sketch0,
          type: ExtrusionType.UP,
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
          capEnds: 1,
        })
        break

      case 'Sketch "1" (Up)':
        const [sketch1] = await api.getSketch(productId, 'Sketch1')
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sketch1,
          type: ExtrusionType.UP,
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
          capEnds: 1,
        })
        break

      case 'Sketch curves (Up)':
        const sketchLines = [481, 487, 495, 503, 511, 519]
        operation = await api.twist({
          partId: productId,
          sketchOrRegionIds: sketchLines,
          type: ExtrusionType.UP,
          limit1: 0,
          limit2: 120,
          twistAngle: Math.PI,
          capEnds: 1,
        })
        break

      default:
        break
    }
  }
  return productId
}

export const cad = new History()

export default { create, update, paramsMap, cad }
