import { ApiNoHistory, solid, createPolyline, FilletPoint, Polyline } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const width = 53
  const depth = 26
  const p1: FilletPoint = { point: new THREE.Vector3(0, 0, 0), radius: 0 }
  const p2: FilletPoint = { point: new THREE.Vector3(0, depth, 0), radius: 0 }
  const p3: FilletPoint = { point: new THREE.Vector3(0, depth, 5), radius: 0 }
  const p4: FilletPoint = { point: new THREE.Vector3(0, 0, depth), radius: 0 }
  const polyline: Polyline = createPolyline([p1, p2, p3, p4])
  const direction = [-width, 0, 0]
  const basicBody = api.extrude(direction, polyline)
  const subBox1 = api.box(11, 10, 20)
  api.moveTo(subBox1, [-5.5, depth, 0])
  api.subtract(basicBody, true, subBox1)
  api.moveTo(subBox1, [-47.5, depth, 0])
  api.subtract(basicBody, false, subBox1)
  const sideBox = api.box(7, 16.7, depth)
  api.moveTo(sideBox, [-3.5, 16.7 / 2, 13])
  api.union(basicBody, true, sideBox)
  api.moveTo(sideBox, [-49.5, 16.7 / 2, 13])
  api.union(basicBody, false, sideBox)
  const subBox2 = api.box(17, 16, depth)
  api.moveTo(subBox2, [-width / 2, 13, 13])
  api.subtract(basicBody, false, subBox2)
  const edges1 = api.pick(basicBody, 'edge', [-3.5, 16.7, depth], [-49.5, 16.7, depth])
  api.fillet(2, edges1)
  const edges2 = api.pick(
    basicBody,
    'edge',
    [-width / 2, 5, 0],
    [-width / 2, 21, 0],
    [-(width - 17) / 2, 13, 0],
    [-(width + 17) / 2, 13, 0],
  )
  api.fillet(2, edges2)
  return [await basicBody]
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
        color: new THREE.Color('rgb(99, 120, 255)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export const cad = new solid()

export default { create, getBufferGeom, paramsMap, cad }
