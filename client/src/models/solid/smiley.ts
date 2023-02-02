import { ObjectID } from '@buerli.io/core'
import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param, ParamType, Update } from '../../store'

export const paramsMap: Param[] = [
  { index: 0, name: 'Happy?', type: ParamType.Checkbox, value: true },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const smileyShape = new THREE.Shape()
  smileyShape.moveTo(80, 40)
  smileyShape.absarc(40, 40, 40, 0, Math.PI * 2, false)
  const smileyShapeBody = api.extrude([0, 0, 5], smileyShape)
  const smileyEye1Path = new THREE.Shape()
  smileyEye1Path.moveTo(35, 20)
  smileyEye1Path.absellipse(25, 20, 10, 10, 0, Math.PI * 2, true, 0)
  const smileyEye1PathBody = api.extrude([0, 0, 5], smileyEye1Path)
  const smileyEye2Path = new THREE.Shape()
  smileyEye2Path.moveTo(65, 20)
  smileyEye2Path.absarc(55, 20, 10, 0, Math.PI * 2, true)
  const smileyEye2PathBody = api.extrude([0, 0, 5], smileyEye2Path)
  const smileyMouthPath = new THREE.Shape()
  smileyMouthPath.moveTo(20, 40)
  smileyMouthPath.quadraticCurveTo(40, 60, 60, 40)
  smileyMouthPath.bezierCurveTo(70, 45, 70, 50, 60, 60)
  smileyMouthPath.quadraticCurveTo(40, 80, 20, 60)
  smileyMouthPath.quadraticCurveTo(5, 50, 20, 40)
  const smileyMouthPathBody = api.extrude([0, 0, 5], smileyMouthPath)

  if (!params.values[0]) {
    api.rotateTo(smileyMouthPathBody, [Math.PI, 0, 0])
    api.moveTo(smileyMouthPathBody, [0, 110, 5])
  }
  const basicBody = api.subtract(
    smileyShapeBody,
    false,
    smileyEye1PathBody,
    smileyEye2PathBody,
    smileyMouthPathBody,
  )
  api.rotateTo(basicBody, [Math.PI, 0, 0])
  return [await basicBody]
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiNoHistory
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    api.clearSolids()
    return create(api, params)
  }
}

export const getBufferGeom = async (solidIds: ObjectID[], api: ApiNoHistory) => {
  if (!api) return
  const meshes: THREE.Mesh[] = []
  for await (const solidId of solidIds) {
    const geom = await api.createBufferGeometry(solidId)
    const mesh = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 1,
        color: new THREE.Color('rgb(252, 252, 45)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export const cad = new solid()

export default { create, getBufferGeom, paramsMap, cad }
