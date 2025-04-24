import * as THREE from 'three'
import { Create, GetBufferGeom, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const fp0 = { point: new THREE.Vector3(0, 25, 0), radius: 50 }
  const fp1 = { point: new THREE.Vector3(75, 25, 0), radius: 0 }
  const fp2 = { point: new THREE.Vector3(75, 0, 0), radius: 0 }
  const fp3 = { point: new THREE.Vector3(100, 0, 0), radius: 20 }
  const fp4 = { point: new THREE.Vector3(150, 120, 0), radius: 0 }
  const fp5 = { point: new THREE.Vector3(25, 75, 0), radius: 5 }
  const fp6 = { point: new THREE.Vector3(25, 100, 0), radius: 0 }
  const fp7 = { point: new THREE.Vector3(0, 100, 0), radius: 10 }

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei as any }) // TODO: fix type in CurveAPI_v1.cclass
  await model.createPolyline(ccShape, [fp0, fp1, fp2, fp3, fp4, fp5, fp6, fp7])
  const { result: revolve } = await api.solid.revolve({
    id: ei,
    curves: [ccShape],
    originPos: [-10, 0, 0],
    direction: [0, 1, 0],
    angle: Math.PI,
  })
  return [revolve]
}

const getBufferGeom: GetBufferGeom = async (model, ids) => {
  if (!model) return
  const meshes: THREE.Mesh[] = []
  ids = Array.isArray(ids) ? ids : [ids]
  for await (const id of ids) {
    const geom = await model.createBufferGeometry(id)
    const mesh = new THREE.Mesh(
      geom[0],
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

export default { create, getBufferGeom, paramsMap }
