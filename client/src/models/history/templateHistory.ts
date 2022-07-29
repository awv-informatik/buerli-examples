import { ApiHistory, history } from '@buerli.io/headless'
import { Param, Create, Update } from '../../store'

export const section = "Gripper"

export const params: Param[] = [
  // number example
  // { index: 0, name: 'Width', type: 'number', value: 60 },
  
  // string example
  // { section, index: 6, name: 'test', type: 'enum', value: 't1', values: ['t2', 't3', 't4'] },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  return 0
}

export const update: Update = async (api, productId, params) => {
  
}

export const cad = new history()

export default { update, create, section, params, cad }
