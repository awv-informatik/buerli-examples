import { ApiNoHistory, Solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const shape = new THREE.Shape()
  shape.moveTo(25, 25)
  shape.bezierCurveTo(25, 25, 20, 0, 0, 0)
  shape.bezierCurveTo(-30, 0, -30, 35, -30, 35)
  shape.bezierCurveTo(-30, 55, -10, 77, 25, 95)
  shape.bezierCurveTo(60, 77, 80, 55, 80, 35)
  shape.bezierCurveTo(80, 35, 80, 0, 50, 0)
  shape.bezierCurveTo(35, 0, 25, 25, 25, 25)
  const basicBody = await api.extrude([0, 0, 5], shape)
  return [basicBody]
}

export const getBufferGeom = async (solidIds: number[], api: ApiNoHistory) => {
  if (!api) return
  const meshes: THREE.Mesh[] = []
  for await (const solidId of solidIds) {
    const geom = await api.createBufferGeometry(solidId)
    const mesh = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 1,
        color: new THREE.Color('rgb(255, 120, 255)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export const cad = new Solid()

export default { create, getBufferGeom, paramsMap, cad }
