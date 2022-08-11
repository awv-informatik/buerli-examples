/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history } from '@buerli.io/headless'
import { Param, Create } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const cad = new history()

export default { create, paramsMap, cad }
