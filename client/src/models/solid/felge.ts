import { ApiNoHistory, solid, createPolyline, Polyline } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const polyline1: Polyline = createPolyline([
    { point: new THREE.Vector3(0, 200, 140), radius: 0 },
    { point: new THREE.Vector3(0, 200, -73.676), radius: 0 },
    { point: new THREE.Vector3(0, 80, -30), radius: 0 },
    { point: new THREE.Vector3(0, 80, 0), radius: 0 },
    { point: new THREE.Vector3(0, 0, 0), radius: 0 },
    { point: new THREE.Vector3(0, 0, -55), radius: 0 },
    { point: new THREE.Vector3(0, 30, -55), radius: 0 },
    { point: new THREE.Vector3(0, 30, -50), radius: 0 },
    { point: new THREE.Vector3(0, 80, -50), radius: 0 },
    { point: new THREE.Vector3(0, 200, -93.676), radius: 0 },
    { point: new THREE.Vector3(0, 200, -140), radius: 0 },
    { point: new THREE.Vector3(0, 220, -140), radius: 0 },
    { point: new THREE.Vector3(0, 220, -135), radius: 0 },
    { point: new THREE.Vector3(0, 205, -135), radius: 0 },
    { point: new THREE.Vector3(0, 205, 135), radius: 0 },
    { point: new THREE.Vector3(0, 220, 135), radius: 0 },
    { point: new THREE.Vector3(0, 220, 140), radius: 0 },
  ])

  const polyline2: Polyline = createPolyline([
    { point: new THREE.Vector3(-85, -10, -137.5), radius: 0 },
    { point: new THREE.Vector3(-185, -36.795, -137.5), radius: 0 },
    { point: new THREE.Vector3(-185, 36.795, -137.5), radius: 0 },
    { point: new THREE.Vector3(-85, 10, -137.5), radius: 0 },
  ])

  const basicBody = api.revolve([0, 0, 0], [0, 0, 100], 2 * Math.PI, polyline1)
  const subSolid = api.extrude([0, 0, 500], polyline2)
  const nof = 6
  const angle = (2 * Math.PI) / nof
  for (let i = 0; i < nof; i++) {
    api.rotateTo(subSolid, [0, 0, i * angle])
    api.subtract(basicBody, true, subSolid)
  }
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
        color: new THREE.Color('rgb(179, 159, 107)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export const cad = new solid()

export default { create, getBufferGeom, paramsMap, cad }
