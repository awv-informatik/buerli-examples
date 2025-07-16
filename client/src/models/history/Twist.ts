/* eslint-disable @typescript-eslint/no-unused-vars */
import { Param, Create, ParamType, Update } from '../../store'
import arraybuffer from '../../resources/history/SketchRegionsTemplate.ofb?buffer'
import { ObjectID } from '@buerli.io/core'
import { Buffer } from 'buffer'

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
      'Sketch "1" (Up)',
    ],
  },
].sort((a, b) => a.index - b.index)

const data = Buffer.from(arraybuffer).toString('base64') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, params, options) => {
  const { common: commonApi, assembly: assemblyApi } = model.api.v1

  const { id: part } = await commonApi.load({ data, format: 'ofb', encoding: 'base64' })

  await update(model, part, { lastUpdatedParam: undefined, values: params.values })

  return part
}

export const update: Update = async (model, productId, params) => {
  const { part: partApi } = model.api.v1
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    if (operation != 0) {
      await partApi.deleteFeature({ ids: [operation] })
    }

    switch (params.values[0]) {
      case 'Sketch region "triangle" (Up)':
        const sRTriangle = await partApi.getSketchRegion({ id: productId, name: 'Triangle' })
        operation = await partApi.twist({
          id: productId,
          references: [sRTriangle],
          type: 'UP',
          limit2: 100,
          twistAngle: Math.PI,
        })
        break

      case 'Sketch region "rectangle" (Down without cap)':
        const sRRectangle = await partApi.getSketchRegion({ id: productId, name: 'Rectangle' })
        operation = await partApi.twist({
          id: productId,
          references: [sRRectangle],
          type: 'DOWN',
          limit1: 0,
          limit2: 80,
          twistAngle: Math.PI / 2,
          capEnds: false,
        })
        break

      case 'Sketch region "moon" (Down)':
        const sRMoon = await partApi.getSketchRegion({ id: productId, name: 'Moon' })
        operation = await partApi.twist({
          id: productId,
          references: [sRMoon],
          type: 'DOWN',
          limit2: 60,
          twistAngle: 2 * Math.PI,
        })
        break

      case 'Sketch region "cross" (Custom limits)':
        const sRCross = await partApi.getSketchRegion({ id: productId, name: 'Cross' })
        operation = await partApi.twist({
          id: productId,
          references: [sRCross],
          type: 'UP',
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
        })
        break

      case 'Sketch region "square" (Custom twist center)':
        const sRSquare = await partApi.getSketchRegion({ id: productId, name: 'Square' })
        operation = await partApi.twist({
          id: productId,
          references: [sRSquare],
          type: 'CUSTOM',
          limit2: 60,
          twistAngle: '180g',
          twistCenter: { x: 10, y: 10, z: 0 },
        })
        break

      case 'Composite curve (Custom limits)':
        const compCurve = await partApi.getFeature({ id: productId, name: 'Composite Curve' })
        operation = await partApi.twist({
          id: productId,
          references: [compCurve],
          type: 'UP',
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
        })
        break

      case 'Sketch "0" (Up)':
        const sketch0 = await partApi.getSketch({ id: productId, name: 'Sketch0' })
        operation = await partApi.twist({
          id: productId,
          references: [sketch0],
          type: 'UP',
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
        })
        break

      case 'Sketch "1" (Up)':
        const sketch1 = await partApi.getSketch({ id: productId, name: 'Sketch1' })
        operation = await partApi.twist({
          id: productId,
          references: [sketch1],
          type: 'UP',
          limit1: 40,
          limit2: 120,
          twistAngle: Math.PI,
        })
        break

      case 'Sketch curves (Up)':
        const sketchLines = [481, 487, 495, 503, 511, 519]
        operation = await partApi.twist({
          id: productId,
          references: sketchLines,
          type: 'UP',
          limit1: 0,
          limit2: 120,
          twistAngle: Math.PI,
        })
        break

      default:
        break
    }
  }
  return productId
}

export default { create, update, paramsMap }
