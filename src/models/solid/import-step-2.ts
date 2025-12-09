import AWVLogoCube from '../../resources/solid/AWVLogoCube.stp?raw'
import { Create, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create({ name: 'Part' })
  const importedId = await api.part.importFeature({ id: part, data: AWVLogoCube, format: 'STP' })
  return [importedId]
}

// The default buerli geometry component will be used, if getScene nor getBufferGeom are exported

export default { create, paramsMap }
