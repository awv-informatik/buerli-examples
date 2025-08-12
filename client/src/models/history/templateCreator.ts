/* eslint-disable @typescript-eslint/no-unused-vars */
import { Param, Create } from '../../store'

// Example for a global module variable to show how it has to be reset if you need such variables
let globalVariable: any = 0

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  // If you have global module variables, they have to be reset here
  globalVariable = 0

  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export default { create, paramsMap }
