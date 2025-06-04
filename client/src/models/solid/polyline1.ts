import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const fp0 = { point: new THREE.Vector3(0, 25, 0), radius: 0 }
  const fp1 = { point: new THREE.Vector3(75, 25, 0), radius: 0 }
  const fp2 = { point: new THREE.Vector3(75, 0, 0), radius: 10 }
  const fp3 = { point: new THREE.Vector3(100, 0, 0), radius: 0 }
  const fp4 = { point: new THREE.Vector3(100, 100, 0), radius: 20 }
  const fp5 = { point: new THREE.Vector3(25, 75, 0), radius: 15 }
  const fp6 = { point: new THREE.Vector3(25, 100, 0), radius: 0 }
  const fp7 = { point: new THREE.Vector3(0, 100, 0), radius: 0 }

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei })
  await model.createPolyline(ccShape, [fp0, fp1, fp2, fp3, fp4, fp5, fp6, fp7])
  const { result: extrusion } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 25] })
  return [extrusion]
}

const getScene: GetScene = async (model, ids) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(ids)
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [extrusion] = ids as ObjectID[]
  const customRed = new Color('rgb(203, 67, 22)')
  setObjectColor(nodes[`${extrusion}`], customRed)
}

export default { create, getScene, paramsMap }
