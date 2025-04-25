/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Color } from 'three'
import { Param, Create } from '../../store'
import { findObjectsByName, setObjectColor } from '../../utils/utils'
import { CadModel } from '../../CadModel'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const getScene = async (productId: number, model: CadModel) => {
  if (!model) return
  const { scene } = await model.createScene(productId)
  scene && colorize(scene)
  return scene
}

const colorize = (scene: THREE.Scene) => {
  // E.g. set a custom color on the object with name = '<name of the node>'
  const customRed = new Color('rgb(203, 67, 22)')
  const [boltObj] = findObjectsByName('<name of the node>', scene)
  setObjectColor(boltObj, customRed)
}

export default { create, getScene, paramsMap }
