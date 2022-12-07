import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import data from '../../resources/solid/Ventil.stp'
import { Create, Param } from '../../store'
import { setSolidsColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const importedIds = await api.import(data)
  return importedIds
}

export const getScene = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds)
  scene && colorize(scene, solids)
  return scene
}

const colorize = (scene: THREE.Scene, solids: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 159, 22)')
  setSolidsColor(solids[0].name, customRed, scene)
}

export const cad = new solid()

export default { create, getScene, paramsMap, cad }
