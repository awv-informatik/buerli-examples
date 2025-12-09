/* eslint-disable @typescript-eslint/no-unused-vars */
import { Create, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  // Start creating your model here...
  // ...
  // ...

  return [0] // solid ids
}

export default { create, paramsMap }
