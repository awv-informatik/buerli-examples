/* eslint-disable @typescript-eslint/no-unused-vars */
import { NOID, ObjectID } from '@buerli.io/core'
import { ApiHistory, history } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, Param } from '../../store'
import { findObjectsByName, setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  // Start creating your model here...
  // ...
  // ...

  return NOID // product id
}

export const getScene = async (productId: ObjectID, api: ApiHistory) => {
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

export const cad = new history()

export default { create, getScene, paramsMap, cad }
