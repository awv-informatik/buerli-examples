/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor, setObjectTransparency } from '../../utils/utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  // Start creating your model here...
  // ...
  // ...

  return [0] // solid ids
}

const getScene: GetScene = async (model, ids) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(ids, { meshPerGeometry: false })
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [id] = ids as ObjectID[]
  const customRed = new THREE.Color('rgb(203, 67, 22)')
  setObjectColor(nodes[`${id}`], customRed)
  setObjectTransparency(nodes[`${id}`], 0.5)
}

export default { create, getScene, paramsMap }
