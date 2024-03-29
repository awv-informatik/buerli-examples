import { ApiNoHistory, Solid, createPolyline, Polyline } from '@buerli.io/headless'
import { Color, Vector3 } from 'three'
import { Create, Param } from '../../store'
import { setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const polyline: Polyline = createPolyline([
    { point: new Vector3(0, 0, 0), radius: 0 },
    { point: new Vector3(0, 4, 0), radius: 0 },
    { point: new Vector3(2.6, 4, 0), radius: 2 },
    { point: new Vector3(6.8, 8.2, 0), radius: 1 },
    { point: new Vector3(2.5, 8.2, 0), radius: 0 },
    { point: new Vector3(2.5, 10, 0), radius: 1 },
    { point: new Vector3(10, 10, 0), radius: 2 },
    { point: new Vector3(10, 2.5, 0), radius: 1 },
    { point: new Vector3(8.2, 2.5, 0), radius: 0 },
    { point: new Vector3(8.2, 6.8, 0), radius: 1 },
    { point: new Vector3(4, 2.6, 0), radius: 2 },
    { point: new Vector3(4, 0, 0), radius: 0 },
  ])
  const extrusion = api.extrude([0, 0, 150], polyline)

  const copy = api.copy(extrusion)
  for (let i = 1; i < 4; i++) {
    api.rotateTo(copy, [0, 0, (i * Math.PI) / 2])
    api.union(extrusion, true, copy)
  }
  api.clearSolid(copy)
  return [await extrusion]
}

export const getScene = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const { scene, solids } = await api.createScene(solidIds)
  scene && colorize(solids)
  return scene
}

const colorize = (solids: THREE.Group[]) => {
  const customRed = new Color('rgb(203, 67, 188)')
  setObjectColor(solids[0], customRed)
}

export const cad = new Solid()

export default { create, getScene, paramsMap, cad }
