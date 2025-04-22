import * as THREE from 'three'
import { Color } from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor, setObjectTransparency } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  const { part: partApi, geometry: geomApi } = model.api.v1
  const { result: part } = await partApi.create({ name: 'Part' })

  await partApi.cylinder({ id: part, diameter: 50, height: 100 })
  const { result: topEdges } = await geomApi.findBrepElemsByPositions({
    id: part,
    type: 'CIRCLE',
    positions: [[{ x: 0, y: 0, z: 100 }]],
  })
  await partApi.fillet({ id: part, references: topEdges, radius: 10 })
  const { result: bottomEdges } = await geomApi.findBrepElemsByPositions({
    id: part,
    type: 'CIRCLE',
    positions: [[{ x: 0, y: 0, z: 0 }]],
  })
  await partApi.chamfer({ id: part, type: 'EQUAL_DISTANCE', references: bottomEdges, distance1: 10 })
  return part
}

export const getScene: GetScene = async (model, productId) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(productId as number, { meshPerGeometry: true })
  scene && colorize(nodes)
  return scene
}

const colorize = (nodes: { [key: string]: THREE.Object3D }) => {
  const customRed = new Color('rgb(203, 67, 22)')
  // Color and set transparency on part node
  setObjectColor(nodes.Part, customRed)
  setObjectTransparency(nodes.Part, 0.5)
}

export default { create, getScene, paramsMap }
