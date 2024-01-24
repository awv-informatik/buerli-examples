/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, History } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Param, Create } from '../../store'
import { findObjectsByName, setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene } = await api.createScene(productId)
  scene && colorize(scene)
  return scene
}

const colorize = (scene: THREE.Scene) => {
  // E.g. set a custom color on the object with name = '<name of the node>'
  const customRed = new Color('rgb(203, 67, 22)')
  const [boltObj] = findObjectsByName('<name of the node>', scene)
  setObjectColor(boltObj, customRed)
}

export const cad = new History()

export default { create, getScene, paramsMap, cad }
