import { ApiHistory, history } from '@buerli.io/headless'
import { Create, Param } from '../../store'
import * as THREE from 'three'
import { ChamferType } from '@buerli.io/classcad'
import { setObjectColor, setObjectTransparency } from '../../utils/utils'
import { Color } from 'three'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const part = api.createPart('Part')
  api.cylinder(part, [], 50, 100)
  const topEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 100 }])
  api.fillet(part, topEdges, 10)
  const bottomEdges = await api.pick(part, 'edge', [{ x: 0, y: 0, z: 0 }])
  api.chamfer(part, ChamferType.EQUAL_DISTANCE, bottomEdges, 10, 0, 0)
  return part
}

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene, nodes } = await api.createScene(productId, { meshPerGeometry: true})
  scene && colorize(nodes)
  return scene
}

const colorize = (nodes: { [key: string]: THREE.Object3D }) => {
  const customRed = new Color('rgb(203, 67, 22)')
  // Color and set transparency on part node
  setObjectColor(nodes.Part, customRed)
  setObjectTransparency(nodes.Part, 0.5)
} 

export const cad = new history()

export default { create, getScene, paramsMap, cad }
