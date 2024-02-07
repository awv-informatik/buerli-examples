import { ApiNoHistory, Solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, Param } from '../../store'
import { setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory
  const lOuterBox = 90
  const lInnerBox = 80
  const dHole = 55

  // Create boxes and cylinders and subtract them
  const b0 = api.box(lOuterBox, lOuterBox, lOuterBox)
  const b3 = api.box(lInnerBox, lInnerBox, lInnerBox)
  api.subtract(b0, false, b3)
  const cyl1 = api.cylinder(2 * lOuterBox, dHole)
  api.subtract(b0, false, cyl1)
  const cyl2 = api.cylinder(2 * lOuterBox, dHole)
  api.rotateTo(cyl2, [0, Math.PI / 2, 0])
  api.subtract(b0, false, cyl2)
  const cyl3 = api.cylinder(2 * lOuterBox, dHole)
  api.rotateTo(cyl3, [Math.PI / 2, 0, 0])
  api.subtract(b0, false, cyl3)

  // Slice lower corners
  api.slice(b0, [-45, -45, -15.556], [-0.5, -0.5, -0.707])
  api.slice(b0, [45, -45, -15.556], [0.5, -0.5, -0.707])
  api.slice(b0, [45, 45, -15.556], [0.5, 0.5, -0.707])
  api.slice(b0, [-45, 45, -15.556], [-0.5, 0.5, -0.707])

  // Slice upper corners
  api.slice(b0, [-45, -45, 15.556], [-0.5, -0.5, 0.707])
  api.slice(b0, [45, -45, 15.556], [0.5, -0.5, 0.707])
  api.slice(b0, [45, 45, 15.556], [0.5, 0.5, 0.707])
  api.slice(b0, [-45, 45, 15.556], [-0.5, 0.5, 0.707])
  return [await b0]
}

export const getScene = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds)
  scene && colorize(solids)
  return scene
}

const colorize = (solids: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 67, 22)')
  setObjectColor(solids[0], customRed)
}

export const cad = new Solid()

export default { create, getScene, paramsMap, cad }
