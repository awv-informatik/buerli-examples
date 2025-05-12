import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils/utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1
  const lOuterBox = 90
  const lInnerBox = 80
  const dHole = 55

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })

  // Create boxes and cylinders and subtract them
  const { result: b0 } = await api.solid.box({ id: ei, length: lOuterBox, width: lOuterBox, height: lOuterBox })
  const { result: b3 } = await api.solid.box({ id: ei, length: lInnerBox, width: lInnerBox, height: lInnerBox })
  await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: b3 }] })

  const { result: cyl1 } = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
  await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl1 }] })

  const { result: cyl2 } = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
  await api.solid.rotation({ id: ei, target: { id: cyl2 }, rotation: [0, Math.PI / 2, 0] })
  await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl2 }] })

  const { result: cyl3 } = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
  await api.solid.rotation({ id: ei, target: { id: cyl3 }, rotation: [Math.PI / 2, 0, 0] })
  await api.solid.subtraction({ id: ei, target: { id: b0 }, tools: [{ id: cyl3 }] })

  // Slice lower corners
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, -45, -15.556], normal: [-0.5, -0.5, -0.707] })
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, -45, -15.556], normal: [0.5, -0.5, -0.707] })
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, 45, -15.556], normal: [0.5, 0.5, -0.707] })
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, 45, -15.556], normal: [-0.5, 0.5, -0.707] })

  //   // Slice upper corners
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, -45, 15.556], normal: [-0.5, -0.5, 0.707] })
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, -45, 15.556], normal: [0.5, -0.5, 0.707] })
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [45, 45, 15.556], normal: [0.5, 0.5, 0.707] })
  await api.solid.slice({ id: ei, target: { id: b0 }, originPos: [-45, 45, 15.556], normal: [-0.5, 0.5, 0.707] })
  return [b0]
}

const getScene: GetScene = async (model, ids) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(ids)
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [id] = ids as ObjectID[]
  const customRed = new THREE.Color('rgb(203, 67, 22)')
  setObjectColor(nodes[`${id}`], customRed)
}

export default { create, getScene, paramsMap }
