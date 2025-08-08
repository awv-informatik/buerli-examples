/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Color } from 'three'
import { BuerliCadFacade } from '@buerli.io/classcad'
import { Param, Create } from '../../store'
import { findObjectsByName, setObjectColor } from '../../utils'

// Example for a global module variable to show how it has to be reset if you need such variables
let globalVariable: any = 0

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  // If you have global module variables, they have to be reset here
  globalVariable = 0

  // Start creating your model here...
  // ...
  // ...

  return 0 // product id
}

export const getScene = async (productId: number, model: BuerliCadFacade) => {
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
