import { ApiNoHistory, solid } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory
  const shape = new THREE.Shape()
  shape.lineTo(100, 0)
  shape.lineTo(100, 20)
  shape.lineTo(20, 20)
  shape.lineTo(20, 50)
  shape.lineTo(10, 50)
  shape.lineTo(10, 100)
  shape.lineTo(0, 100)
  shape.lineTo(0, 0)
  const basicBody = api.extrude([0, 0, 100], shape)
  const edges1 = api.pick(
    basicBody,
    'edge',
    [100, 10, 0],
    [100, 10, 100],
    [5, 100, 100],
    [5, 100, 0],
  )
  const edges2 = api.pick(basicBody, 'edge', [10, 50, 50], [0, 0, 50], [20, 20, 50])
  api.fillet(5, edges1)
  api.fillet(5, edges2)
  const cyl1 = api.cylinder(200, 40)
  api.moveTo(cyl1, [-50, 50, 50])
  api.rotateTo(cyl1, [0, Math.PI / 2, 0])
  const cyl2 = api.cylinder(200, 40)
  api.moveTo(cyl2, [55, 50, 50])
  api.rotateTo(cyl2, [Math.PI / 2, 0, 0])
  api.subtract(basicBody, false, cyl1, cyl2)
  const offset = api.offset(basicBody, 1)
  return [await offset]
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
        color: new THREE.Color('rgb(150, 120, 255)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export const cad = new solid()

export default { create, paramsMap, cad }
