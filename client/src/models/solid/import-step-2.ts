/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer'
import AWVLogoCube from '../../resources/solid/AWVLogoCube.stp?raw'
import { Create, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)
const data = Buffer.from(AWVLogoCube).toString('base64') // TODO: how to support ArrayBuffer in the API?

const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create({ name: 'Part' })
  const importedId = await api.part.importFeature({ id: part, data, format: 'STP', encoding: 'base64' })
  return [importedId]
}

// The default buerli geometry component will be used, if getScene nor getBufferGeom are exported

export default { create, paramsMap }
