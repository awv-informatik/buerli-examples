/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Create, GetBufferGeom, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const shape = new THREE.Shape()
  shape.moveTo(25, 25)
  shape.bezierCurveTo(25, 25, 20, 0, 0, 0)
  shape.bezierCurveTo(-30, 0, -30, 35, -30, 35)
  shape.bezierCurveTo(-30, 55, -10, 77, 25, 95)
  shape.bezierCurveTo(60, 77, 80, 55, 80, 35)
  shape.bezierCurveTo(80, 35, 80, 0, 50, 0)
  shape.bezierCurveTo(35, 0, 25, 25, 25, 25)

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei as any }) // TODO: fix type in CurveAPI_v1.cclass
  await model.createThreeShape(ccShape, shape)

  const { result: basicBody } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 5] })
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
        color: new THREE.Color('rgb(255, 120, 255)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export default { create, getBufferGeom, paramsMap }
