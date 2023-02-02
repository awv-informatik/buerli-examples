/* eslint-disable @typescript-eslint/no-unused-vars */
import { NOID } from '@buerli.io/core'
import { ApiNoHistory, solid } from '@buerli.io/headless'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  // Start creating your model here...
  // ...
  // ...

  return [NOID] // solid ids
}

export const cad = new solid()

export default { create, paramsMap, cad }
