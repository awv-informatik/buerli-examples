import { ApiNoHistory, solid, createPolyline, FilletPoint, Polyline } from '@buerli.io/headless'
import { Color, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { Create, Param } from '../../store'
import { setNodesColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const fp0: FilletPoint = { point: new Vector3(0, 0, 0), radius: 0 }
  const fp1: FilletPoint = { point: new Vector3(0, 4, 0), radius: 0 }
  const fp2: FilletPoint = { point: new Vector3(2.6, 4, 0), radius: 2 }
  const fp3: FilletPoint = { point: new Vector3(6.8, 8.2, 0), radius: 1 }
  const fp4: FilletPoint = { point: new Vector3(2.5, 8.2, 0), radius: 0 }
  const fp5: FilletPoint = { point: new Vector3(2.5, 10, 0), radius: 1 }
  const fp6: FilletPoint = { point: new Vector3(10, 10, 0), radius: 2 }
  const fp7: FilletPoint = { point: new Vector3(10, 2.5, 0), radius: 1 }
  const fp8: FilletPoint = { point: new Vector3(8.2, 2.5, 0), radius: 0 }
  const fp9: FilletPoint = { point: new Vector3(8.2, 6.8, 0), radius: 1 }
  const fp10: FilletPoint = { point: new Vector3(4, 2.6, 0), radius: 2 }
  const fp11: FilletPoint = { point: new Vector3(4, 0, 0), radius: 0 }
  const polyline: Polyline = createPolyline([fp0, fp1, fp2, fp3, fp4, fp5, fp6, fp7, fp8, fp9, fp10, fp11])
  const extrusion = api.extrude([0, 0, 150], polyline)

  const copy = api.copy(extrusion)
  for (let i = 1; i < 4; i++) {
    api.rotateTo(copy, [0, 0, (i * Math.PI) / 2])
    api.union(extrusion, true, copy)
  }
  api.clearSolid(copy)
  return extrusion
}

export const getScene = async (solidId: number, api: ApiNoHistory) => {
  if (!api) return
  const scene = await api.createScene(solidId)
  scene && colorize(scene)
  return scene
}

const colorize = (scene: THREE.Scene) => {
  const customRed = new Color('rgb(203, 67, 188)')
  setNodesColor('Solid', customRed, scene)
}

export const cad = new solid()

export default { create, getScene, paramsMap, cad }
