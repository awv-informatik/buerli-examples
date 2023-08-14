import { ApiHistory, history } from '@buerli.io/headless'
import { Create, Param, ParamType, Update } from '../../store'
import data from '../../resources/history/CaseAssembly.ofb'

export const paramsMap: Param[] = [
  { index: 0, name: 'width', type: ParamType.Number, value: 120 },
  { index: 1, name: 'height', type: ParamType.Number, value: 50 },
  { index: 2, name: 'depth', type: ParamType.Number, value: 160 },
].sort((a, b) => a.index - b.index)

let deltaX = 0
let deltaY = 0
let deltaZ = 0

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const [root] = await api.load(data, 'ofb', { ident: 'root' })
  deltaX = (params.values[0] - 10) / 2
  deltaY = (params.values[1] - 10) / 2
  deltaZ = params.values[2] + 2.5

  await api.addInstances(
    {
      productId: 'Screw', // by name
      ownerId: 'root', // by ident
      transformation: [
        { x: -deltaX, y: deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'ScrewInstance1',
      options: { ident: 'ScrewInstanceIdent1' },
    },
    {
      productId: 'Screw', // by name
      ownerId: 'root', // by ident
      transformation: [
        { x: deltaX, y: deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      name: 'ScrewInstance2',
    },
  )
  return root
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  if (Array.isArray(productId)) {
    throw new Error(
      'Calling update does not support multiple product ids. Use a single product id only.',
    )
  }
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update case expressions
  if (check(paramsMap[0]) || check(paramsMap[1]) || check(paramsMap[2])) {
    await api.setExpressions({
      partId: 'Case',
      members: [
        {
          name: 'width',
          value: params.values[0],
        },
        {
          name: 'height',
          value: params.values[1],
        },
        {
          name: 'depth',
          value: params.values[2],
        },
      ],
    }, {
      partId: 'Cover',
      members: [
        {
          name: 'width',
          value: params.values[0],
        },
        {
          name: 'height',
          value: params.values[1],
        },
      ],
    })
  }

  // Update transformation of screw instances
  if (check(paramsMap[0]) || check(paramsMap[1]) || check(paramsMap[2])) {
    deltaX = (params.values[0] - 10) / 2
    deltaY = (params.values[1] - 10) / 2
    deltaZ = params.values[2] + 2.5
    await api.transformInstances({
      id: 'ScrewInstance1',
      transformation: [
        { x: -deltaX, y: deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
    }, {
      id: 'ScrewInstance2',
      transformation: [
        { x: deltaX, y: deltaY, z: deltaZ },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
    })
  }

  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }
