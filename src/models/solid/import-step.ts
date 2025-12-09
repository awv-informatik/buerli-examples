import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Color } from 'three'
import Ventil from '../../resources/solid/Ventil.stp?raw'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create({ name: 'Part' })
  const importedId = await api.part.importFeature({ id: part, data: Ventil, format: 'STP' })
  return [importedId]
}

const getScene: GetScene = async (model, ids) => {
  if (!model) return
  ids = Array.isArray(ids) ? ids : [ids]
  const { scene, nodes } = await model.createScene(ids)
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [id] = ids as ObjectID[]
  const customRed = new Color('rgb(203, 159, 22)')
  setObjectColor(nodes[`${id}`], customRed)
}

export default { create, getScene, paramsMap }
