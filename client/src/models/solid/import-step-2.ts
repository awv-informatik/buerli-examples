import { ApiNoHistory, solid } from '@buerli.io/headless'
import data from '../../resources/solid/AWVLogoCube.stp?raw'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const importedIds = await api.import(data as any)
  return importedIds
}

export const cad = new solid()

export default { create, paramsMap, cad }
