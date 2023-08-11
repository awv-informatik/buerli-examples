import { ApiHistory, history } from '@buerli.io/headless'
import { Create, Param } from '../../store'
import data from '../../resources/history/CaseAssembly.ofb'


export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const [root] = await api.load(data, 'ofb', { ident: 'root'})

  await api.addInstances(
    {
    productId: 'Screw', // by name
    ownerId: 'root',  // by ident
    transformation: [{x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}],
    name: 'ScrewInstance1',
    options: { ident: 'ScrewInstanceIdent1'}
  },
  {
    productId: 'Screw', // by name
    ownerId: 'root',  // by ident
    transformation: [{x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}],
    name: 'ScrewInstance2'
  })

  await api.transformInstances(
    {
      id: 'ScrewInstance1', // by name
      transformation: [{x: -55, y: 20, z: 162.5}, {x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}]
    },
    {
      id: 'ScrewInstance2', // by name
      transformation: [{x: 55, y: 20, z: 162.5}, {x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}]
    }
  )

  await api.removeInstances(
    { 
      id: 'ScrewInstanceIdent1' // by ident
    }
  )

  await api.addInstances(
    {
      productId: 'Screw', // by name
      ownerId: 'root',  // by ident
      transformation: [{x: -55, y: 20, z: 162.5}, {x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}],
      name: 'ScrewInstance1',
      options: { ident: 'ScrewInstanceIdent1'}
    }
  )

  await api.transformInstances(
    {
      id: 'ScrewInstanceIdent1',  // by ident
      transformation: [{x: -55, y: 20, z: 162.5}, {x: 1, y: 0, z: 0}, {x: 0, y: 1, z: 0}]
    },
  )

  
  return root
}

export const cad = new history()

export default { create, paramsMap, cad }
