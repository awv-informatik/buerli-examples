import * as THREE from 'three'
import { Create, GetBufferGeom, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const part = await api.part.create()
  const ei = await api.part.entityInjection({ id: part })

  const ccShape1 = await api.curve.shape({ id: ei })
  await model.createPolyline(ccShape1, [
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

  const ccShape2 = await api.curve.shape({ id: ei })
  await model.createPolyline(ccShape2, [
    { point: new THREE.Vector3(-85, -10, -137.5), radius: 0 },
    { point: new THREE.Vector3(-185, -36.795, -137.5), radius: 0 },
    { point: new THREE.Vector3(-185, 36.795, -137.5), radius: 0 },
    { point: new THREE.Vector3(-85, 10, -137.5), radius: 0 },
  ])

  const basicBody = await api.solid.revolve({
    id: ei,
    curves: [ccShape1],
    originPos: [0, 0, 0],
    direction: [0, 0, 100],
    angle: 2 * Math.PI,
  })
  const subSolid = await api.solid.extrusion({ id: ei, curves: [ccShape2], direction: [0, 0, 500] })

  const nof = 6
  const angle = (2 * Math.PI) / nof
  for (let i = 0; i < nof; i++) {
    const copy = await api.solid.copy({ id: ei, target: subSolid, rotation: [0, 0, i * angle] })
    await api.solid.subtraction({ id: ei, target: basicBody, tools: [copy] })
  }
  return [basicBody]
}

const getBufferGeom: GetBufferGeom = async (model, ids) => {
  if (!model) return
  const meshes: THREE.Mesh[] = []
  ids = Array.isArray(ids) ? ids : [ids]
  for await (const solidId of ids) {
    const geom = await model.createBufferGeometry(solidId)
    const mesh = new THREE.Mesh(
      geom[0],
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

export default { create, getBufferGeom, paramsMap }
