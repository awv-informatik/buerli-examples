import { ChamferType } from '@buerli.io/classcad'
import { ObjectID } from '@buerli.io/core'
import { ApiHistory, history } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, Param } from '../../store'
import { setObjectColor, setObjectTransparency } from '../../utils/utils'

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

export const getScene = async (productId: ObjectID, api: ApiHistory) => {
  if (!api) return
  const { scene, nodes } = await api.createScene(productId, { meshPerGeometry: true })
  scene && colorize(nodes)
  return scene
}

const colorize = (nodes: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 67, 22)')
  // Color and set transparency on first found node
  setObjectColor(nodes[0], customRed)
  setObjectTransparency(nodes[0], 0.5)
}

export const cad = new history()

export default { create, getScene, paramsMap, cad }
