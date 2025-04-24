import * as THREE from 'three'
import { Create, GetBufferGeom, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const width = 53
  const depth = 26
  const direction = [-width, 0, 0] as [number, number, number] // TODO: type point = { x: number; y: number; z: number;} | [number, number, number] | number[]
  const p1 = { point: new THREE.Vector3(0, 0, 0), radius: 0 }
  const p2 = { point: new THREE.Vector3(0, depth, 0), radius: 0 }
  const p3 = { point: new THREE.Vector3(0, depth, 5), radius: 0 }
  const p4 = { point: new THREE.Vector3(0, 0, depth), radius: 0 }

  const { result: part } = await api.part.create()
  const { result: ei } = await api.part.entityInjection({ id: part })
  const { result: ccShape } = await api.curve.shape({ id: ei as any }) // TODO: fix type in CurveAPI_v1.cclass
  await model.createPolyline(ccShape, [p1, p2, p3, p4])
  const { result: basicBody } = await api.solid.extrusion({ id: ei, curves: [ccShape], direction })

  const { result: subBox1 } = await api.solid.box({ id: ei, length: 11, width: 10, height: 20 })
  await api.solid.translation({ id: ei, target: { id: subBox1 }, translation: [-5.5, depth, 0] })
  await api.solid.subtraction({ id: ei, target: { id: basicBody }, tool: { id: subBox1 }, keepTool: true })
  await api.solid.translation({ id: ei, target: { id: subBox1 }, translation: [-42, 0, 0] })
  await api.solid.subtraction({ id: ei, target: { id: basicBody }, tool: { id: subBox1 }, keepTool: false })

  const { result: sideBox } = await api.solid.box({ id: ei, length: 7, width: 16.7, height: depth })
  await api.solid.translation({ id: ei, target: { id: sideBox }, translation: [-3.5, 16.7 / 2, 13] })
  await api.solid.union({ id: ei, target: { id: basicBody }, tool: { id: sideBox }, keepTool: true })
  await api.solid.translation({ id: ei, target: { id: sideBox }, translation: [-46, 0, 0] })
  await api.solid.union({ id: ei, target: { id: basicBody }, tool: { id: sideBox }, keepTool: false })

  const { result: subBox2 } = await api.solid.box({ id: ei, length: 17, width: 16, height: depth })
  await api.solid.translation({ id: ei, target: { id: subBox2 }, translation: [-width / 2, 13, 13] })
  await api.solid.subtraction({ id: ei, target: { id: basicBody }, tool: { id: subBox2 }, keepTool: false })

  const { result: edges1 } = await api.geometry.findBrepElemsByPositions({
    id: part,
    type: 'LINE',
    positions: [[[-3.5, 16.7, depth]], [[-49.5, 16.7, depth]]],
  })
  await api.solid.fillet({ radius: 2, geomIds: edges1 })

  const { result: edges2 } = await api.geometry.findBrepElemsByPositions({
    id: part,
    type: 'LINE',
    positions: [
      [[-width / 2, 5, 0]],
      [[-width / 2, 21, 0]],
      [[-(width - 17) / 2, 13, 0]],
      [[-(width + 17) / 2, 13, 0]],
    ],
  })
  await api.solid.fillet({ radius: 2, geomIds: edges2 })

  return [basicBody]
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
        color: new THREE.Color('rgb(99, 120, 255)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export default { create, getBufferGeom, paramsMap }
