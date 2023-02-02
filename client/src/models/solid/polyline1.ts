import { ObjectID } from '@buerli.io/core'
import { ApiNoHistory, createPolyline, FilletPoint, Polyline, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Color } from 'three'
import { Create, Param } from '../../store'
import { setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const fp0: FilletPoint = { point: new THREE.Vector3(0, 25, 0), radius: 0 }
  const fp1: FilletPoint = { point: new THREE.Vector3(75, 25, 0), radius: 0 }
  const fp2: FilletPoint = { point: new THREE.Vector3(75, 0, 0), radius: 10 }
  const fp3: FilletPoint = { point: new THREE.Vector3(100, 0, 0), radius: 0 }
  const fp4: FilletPoint = { point: new THREE.Vector3(100, 100, 0), radius: 20 }
  const fp5: FilletPoint = { point: new THREE.Vector3(25, 75, 0), radius: 15 }
  const fp6: FilletPoint = { point: new THREE.Vector3(25, 100, 0), radius: 0 }
  const fp7: FilletPoint = { point: new THREE.Vector3(0, 100, 0), radius: 0 }
  const polyline: Polyline = createPolyline([fp0, fp1, fp2, fp3, fp4, fp5, fp6, fp7])
  const extrusion = await api.extrude([0, 0, 25], polyline)
  return [extrusion]
}

export const getScene = async (solidIds: ObjectID[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds)
  scene && colorize(solids)
  return scene
}

const colorize = (solids: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 67, 22)')
  setObjectColor(solids[0], customRed)
}

export const cad = new solid()

export default { create, getScene, paramsMap, cad }
