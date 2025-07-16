import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const part = await api.part.create()
  const ei = await api.part.entityInjection({ id: part })
  const ccShape = await api.curve.shape({ id: ei })

  const pld = [
    { xa: 0, ya: 0 },
    { xa: 0, ya: 4 },
    { xa: 2.6, ya: 4 },
    { xa: 6.8, ya: 8.2, r: 1 },
    { xa: 2.5, ya: 8.2 },
    { xa: 2.5, ya: 10, r: 1 },
    { xa: 10, ya: 10, c: 2 },
    { xa: 10, ya: 2.5, c: 2 },
    { xa: 8.2, ya: 2.5 },
    { xa: 8.2, ya: 6.8, r: 1 },
    { xa: 4, ya: 2.6, c: 2 },
    { xa: 4, ya: 0 },
  ]

  await api.curve.advancedPolyline({ id: ccShape, pld: pld, close: true })

  const extrusion = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 150] })

  for (let i = 1; i < 4; i++) {
    const e1 = await api.solid.copy({ id: ei, target: { id: extrusion } })
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
