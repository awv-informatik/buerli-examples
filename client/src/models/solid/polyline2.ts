import { ApiNoHistory, Solid, createPolyline } from '@buerli.io/headless'
import * as THREE from 'three'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiNoHistory

  const fp0 = { point: new THREE.Vector3(0, 25, 0), radius: 50 }
  const fp1 = { point: new THREE.Vector3(75, 25, 0), radius: 0 }
  const fp2 = { point: new THREE.Vector3(75, 0, 0), radius: 0 }
  const fp3 = { point: new THREE.Vector3(100, 0, 0), radius: 20 }
  const fp4 = { point: new THREE.Vector3(150, 120, 0), radius: 0 }
  const fp5 = { point: new THREE.Vector3(25, 75, 0), radius: 5 }
  const fp6 = { point: new THREE.Vector3(25, 100, 0), radius: 0 }
  const fp7 = { point: new THREE.Vector3(0, 100, 0), radius: 10 }
  const polyline = createPolyline([fp0, fp1, fp2, fp3, fp4, fp5, fp6, fp7])
  const revolve = await api.revolve([-10, 0, 0], [0, 1, 0], Math.PI, polyline)
  return [revolve]
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
        color: new THREE.Color('rgb(255, 120, 106)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export const cad = new Solid()

export default { create, getBufferGeom, paramsMap, cad }
