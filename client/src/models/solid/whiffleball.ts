import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1
  const lOuterBox = 90
  const lInnerBox = 80
  const dHole = 55

  const part = await api.part.create()
  const ei = await api.part.entityInjection({ id: part })

  // Create boxes and cylinders and subtract them
  const b0 = await api.solid.box({ id: ei, length: lOuterBox, width: lOuterBox, height: lOuterBox })
  const b3 = await api.solid.box({ id: ei, length: lInnerBox, width: lInnerBox, height: lInnerBox })
  await api.solid.subtraction({ id: ei, target: b0, tools: [b3] })

  const cyl1 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole })
  await api.solid.subtraction({ id: ei, target: b0, tools: [cyl1] })

  const cyl2 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole, rotation: [0, Math.PI / 2, 0] })
  await api.solid.subtraction({ id: ei, target: b0, tools: [cyl2] })

  const cyl3 = await api.solid.cylinder({ id: ei, height: 2 * lOuterBox, diameter: dHole, rotation: [Math.PI / 2, 0, 0] })
  await api.solid.subtraction({ id: ei, target: b0, tools: [cyl3] })

  // Slice lower corners
  await api.solid.slice({ id: ei, target: b0, originPos: [-45, -45, -15.556], normal: [-0.5, -0.5, -0.707] })
  await api.solid.slice({ id: ei, target: b0, originPos: [45, -45, -15.556], normal: [0.5, -0.5, -0.707] })
  await api.solid.slice({ id: ei, target: b0, originPos: [45, 45, -15.556], normal: [0.5, 0.5, -0.707] })
  await api.solid.slice({ id: ei, target: b0, originPos: [-45, 45, -15.556], normal: [-0.5, 0.5, -0.707] })

  //   // Slice upper corners
  await api.solid.slice({ id: ei, target: b0, originPos: [-45, -45, 15.556], normal: [-0.5, -0.5, 0.707] })
  await api.solid.slice({ id: ei, target: b0, originPos: [45, -45, 15.556], normal: [0.5, -0.5, 0.707] })
  await api.solid.slice({ id: ei, target: b0, originPos: [45, 45, 15.556], normal: [0.5, 0.5, 0.707] })
  await api.solid.slice({ id: ei, target: b0, originPos: [-45, 45, 15.556], normal: [-0.5, 0.5, 0.707] })
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
