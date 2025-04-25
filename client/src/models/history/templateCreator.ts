/* eslint-disable @typescript-eslint/no-unused-vars */
import { Param, Create } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export default { create, paramsMap }
