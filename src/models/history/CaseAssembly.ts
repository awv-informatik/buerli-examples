import { BuerliCadFacade } from '@buerli.io/classcad'
import arrayBuffer from '../../resources/history/CaseAssembly.ofb?buffer'
import { Create, Param, ParamType, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'width', type: ParamType.Slider, value: 120, step: 2, values: [30, 200] },
  { index: 1, name: 'height', type: ParamType.Slider, value: 50, step: 2, values: [30, 200] },
  { index: 2, name: 'depth', type: ParamType.Slider, value: 160, step: 2, values: [30, 200] },
].sort((a, b) => a.index - b.index)

let deltaX = 0
let deltaY = 0
let deltaZ = 0

const data = arrayBuffer

export const create: Create = async (model, params) => {
  const { assembly: assemblyApi, common: commonApi } = model.api.v1

  const { id: root } = await commonApi.load({ data: data, format: 'OFB', ident: 'root' })

  // screw distances from origin depending on parameters
  deltaX = (params.values[0] - 10) / 2
  deltaY = (params.values[1] - 10) / 2
  deltaZ = params.values[2] + 2.5

  await updateExpressions(params.values[0], params.values[1], params.values[2], model)

  await assemblyApi.instance([
    {
      productId: 'Screw',
      ownerId: 'root', // by ident
      transformation: [
        { x: -deltaX, y: deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'ScrewInstance1', // defining a name
      ident: 'ScrewInstanceIdent1', // defining an ident}
    },
    {
      productId: 'Screw',
      ownerId: 'root',
      transformation: [
        { x: deltaX, y: deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'ScrewInstance2',
    },
    {
      productId: 'Screw',
      ownerId: 'root',
      transformation: [
        { x: -deltaX, y: -deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'ScrewInstance3',
      ident: 'ScrewInstanceIdent3',
    },
    {
      productId: 'Screw',
      ownerId: 'root',
      transformation: [
        { x: deltaX, y: -deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'ScrewInstance4',
    },
  ])

  return root
}

export const update: Update = async (model, productId, params) => {
  const { assembly: assemblyApi } = model.api.v1

  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update case and cover expressions
  if (check(paramsMap[0]) || check(paramsMap[1]) || check(paramsMap[2])) {
    await updateExpressions(params.values[0], params.values[1], params.values[2], model)
  }

  // Update transformation of screw instances
  if (check(paramsMap[0]) || check(paramsMap[1]) || check(paramsMap[2])) {
    // screw distances from origin depending on parameters
    deltaX = (params.values[0] - 10) / 2
    deltaY = (params.values[1] - 10) / 2
    deltaZ = params.values[2] + 2.5

    await assemblyApi.transformInstanceTo([
      {
        id: 'ScrewInstanceIdent1', // by ident
        transformation: [
          { x: -deltaX, y: deltaY, z: deltaZ },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
        ],
      },
      {
        id: 'ScrewInstance2', // by name
        transformation: [
          { x: deltaX, y: deltaY, z: deltaZ },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
        ],
      },
      {
        id: 'ScrewInstanceIdent3',
        transformation: [
          { x: -deltaX, y: -deltaY, z: deltaZ },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
        ],
      },
      {
        id: 'ScrewInstance4',
        transformation: [
          { x: deltaX, y: -deltaY, z: deltaZ },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
        ],
      },
    ])
  }

  return productId
}

const updateExpressions = async (width: number, height: number, depth: number, model: BuerliCadFacade) => {
  await model.api.v1.part.updateExpression([
    {
      id: 'Case',
      toUpdate: [
        { name: 'width', value: width },
        { name: 'height', value: height },
        { name: 'depth', value: depth },
      ],
    },
    {
      id: 'Cover',
      toUpdate: [
        { name: 'width', value: width },
        { name: 'height', value: height },
      ],
    },
  ])
}

export default { create, update, paramsMap }
