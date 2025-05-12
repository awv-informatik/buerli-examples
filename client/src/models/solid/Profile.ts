import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils/utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei })

  await model.createPolyline(ccShape, [
    { point: new THREE.Vector3(0, 0, 0), radius: 0 },
    { point: new THREE.Vector3(0, 4, 0), radius: 0 },
    { point: new THREE.Vector3(2.6, 4, 0), radius: 2 },
    { point: new THREE.Vector3(6.8, 8.2, 0), radius: 1 },
    { point: new THREE.Vector3(2.5, 8.2, 0), radius: 0 },
    { point: new THREE.Vector3(2.5, 10, 0), radius: 1 },
    { point: new THREE.Vector3(10, 10, 0), radius: 2 },
    { point: new THREE.Vector3(10, 2.5, 0), radius: 1 },
    { point: new THREE.Vector3(8.2, 2.5, 0), radius: 0 },
    { point: new THREE.Vector3(8.2, 6.8, 0), radius: 1 },
    { point: new THREE.Vector3(4, 2.6, 0), radius: 2 },
    { point: new THREE.Vector3(4, 0, 0), radius: 0 },
  ])
  const { result: extrusion } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 150] })

  for (let i = 1; i < 4; i++) {
    const { result: e1 } = await api.solid.copy({ id: ei, target: { id: extrusion } })
    await api.solid.rotation({ id: ei, target: { id: e1.copy }, rotation: [0, 0, (i * Math.PI) / 2] })
    await api.solid.union({ id: ei, target: { id: extrusion }, tools: [{ id: e1.copy }] })
  }
  return [extrusion]
}

const getScene: GetScene = async (model, ids) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(ids)
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [id] = ids as ObjectID[]
  const customRed = new THREE.Color('rgb(203, 67, 188)')
  setObjectColor(nodes[`${id}`], customRed)
}

export default { create, getScene, paramsMap }
