import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)


const create: Create = async (model, params) => {
  const api = model.api.v1
  const pld = [{ xa: 0, ya: 25 }, { xa: 75, ya: 25 }, 
    { xa: 75, ya: 0, r: 10 }, { xa: 100, ya: 0 },
    { xa: 100, ya: 100, r: 20 }, { xa: 25, ya: 75, r: 15 }, 
    { xa: 25, ya: 100 }, { xa: 0, ya: 100 }];
  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei })
  await api.curve.advancedPolyline({ id: ccShape, pld: pld, close: true })
 
  const { result: extrusion } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 25] })
  
  //const extrusion  = await r(api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 25] }))
  
  
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
