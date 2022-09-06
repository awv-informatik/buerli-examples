import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param, ParamType, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Rows', type: ParamType.Number, value: 2 },
  { index: 1, name: 'Colums', type: ParamType.Number, value: 5 },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const rows = params.values[0]
  const columns = params.values[1]
  const unitLength = 8
  const width = rows * unitLength
  const length = columns * unitLength
  const thickness = 1.6
  const height = unitLength + thickness
  const dotHeight = 1.7
  const dotRadius = 2.4
  const dotGap = dotRadius + thickness
  const tubeHeight = height - thickness
  const tubeRadius = (2 * dotGap * Math.sqrt(2) - 2 * dotRadius) / 2
  // body
  const basic = api.box(width, height, length)
  const subBox = api.box(width - 2 * thickness, height - thickness, length - 2 * thickness)
  api.moveTo(subBox, [0, -thickness, 0])
  api.subtract(basic, false, subBox)
  // dots
  const dot = api.cylinder(dotHeight, 2 * dotRadius)
  api.rotateTo(dot, [Math.PI / 2, 0, 0])
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      api.moveTo(dot, [
        width / 2 - dotGap - j * (2 * dotGap),
        (height + dotHeight) / 2,
        length / 2 - dotGap - i * (2 * dotGap),
      ])
      api.union(basic, true, dot)
    }
  }
  api.clearSolid(dot)
  // tubes
  if (rows > 1 && columns > 1) {
    const tube = api.cylinder(tubeHeight, 2 * tubeRadius)
    const subCyl = api.cylinder(tubeHeight, 2 * (tubeRadius - thickness))
    api.subtract(tube, false, subCyl)
    api.rotateTo(tube, [Math.PI / 2, 0, 0])
    api.moveTo(tube, [0, -thickness / 2, 0])
    for (let i = 0; i < columns - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        api.moveTo(tube, [
          width / 2 - 2 * dotGap - j * (2 * dotGap),
          -thickness / 2,
          length / 2 - 2 * dotGap - i * (2 * dotGap),
        ])
        api.union(basic, true, tube)
      }
    }
    api.clearSolid(tube)
  }
  return basic
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiNoHistory
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0]) || check(paramsMap[1])) {
    api.clearSolid(productId)
    return create(api, params)
  }
}

export const getBufferGeom = async (solidId: number, api: ApiNoHistory) => {
  if (!api) return
  const geom = await api.createBufferGeometry(solidId)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 1,
      color: new THREE.Color('rgb(70, 0, 70)'),
    }),
  )
  return [mesh]
}

export const cad = new solid()

export default { create, getBufferGeom, paramsMap, cad }
