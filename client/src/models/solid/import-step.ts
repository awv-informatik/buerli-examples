import { ApiNoHistory, Solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import data from '../../resources/solid/Ventil.stp?raw'
import { Create, Param } from '../../store'
import { setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const importedIds = await api.import(data as any)
  return importedIds
}

export const getScene = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds)
  scene && colorize(solids)
  return scene
}

const colorize = (solids: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 159, 22)')
  setObjectColor(solids[0], customRed)
}

export const cad = new Solid()

export default { create, getScene, paramsMap, cad }
