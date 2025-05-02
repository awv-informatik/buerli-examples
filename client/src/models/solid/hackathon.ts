/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Create, GetBufferGeom, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const shape = new THREE.Shape()
  shape.lineTo(100, 0)
  shape.lineTo(100, 20)
  shape.lineTo(20, 20)
  shape.lineTo(20, 50)
  shape.lineTo(10, 50)
  shape.lineTo(10, 100)
  shape.lineTo(0, 100)
  shape.lineTo(0, 0)

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei })
  await model.createThreeShape(ccShape, shape)

  const { result: basicBody } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 100] })

  const positions1 = [{ pos: [100, 10, 0] }, { pos: [100, 10, 100] }, { pos: [5, 100, 100] }, { pos: [5, 100, 0] }]
  const edges1 = (await api.part.getGeometryIds({ id: part, lines: positions1 })).result.lines

  const positions2 = [{ pos: [10, 50, 50] }, { pos: [0, 0, 50] }, { pos: [20, 20, 50] }]
  const edges2 = (await api.part.getGeometryIds({ id: part, lines: positions2 })).result.lines

  await api.solid.fillet({ radius: 5, geomIds: edges1 })
  await api.solid.fillet({ radius: 5, geomIds: edges2 })

  const { result: cyl1 } = await api.solid.cylinder({ id: ei, height: 200, diameter: 40 })
  await api.solid.translation({ id: ei, target: { id: cyl1 }, translation: [-50, 50, 50] })
  await api.solid.rotation({ id: ei, target: { id: cyl1 }, rotation: [0, Math.PI / 2, 0] })

  const { result: cyl2 } = await api.solid.cylinder({ id: ei, height: 200, diameter: 40 })
  await api.solid.translation({ id: ei, target: { id: cyl2 }, translation: [55, 50, 50] })
  await api.solid.rotation({ id: ei, target: { id: cyl2 }, rotation: [Math.PI / 2, 0, 0] })

  await api.solid.subtraction({ id: ei, target: { id: basicBody }, tool: { id: cyl1 } })
  await api.solid.subtraction({ id: ei, target: { id: basicBody }, tool: { id: cyl2 } })

  const { result: offset } = await api.solid.offset({ id: ei, target: { id: basicBody }, distance: 1, extend: false })
  return [offset]
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
        color: new THREE.Color('rgb(150, 120, 255)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export default { create, getBufferGeom, paramsMap }
