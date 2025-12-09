/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from 'three'
import { Create, GetBufferGeom, Param, ParamType, Update } from '../../store'

const paramsMap: Param[] = [
  { index: 0, name: 'Rows', type: ParamType.Number, value: 2 },
  { index: 1, name: 'Colums', type: ParamType.Number, value: 5 },
].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const rows = params.values[0]
  const columns = params.values[1]
  const unitLength = 8
  const length = rows * unitLength
  const width = columns * unitLength
  const thickness = 1.6
  const height = unitLength + thickness
  const dotHeight = 1.7
  const dotRadius = 2.4
  const dotGap = dotRadius + thickness
  const tubeHeight = height - thickness
  const tubeRadius = (2 * dotGap * Math.sqrt(2) - 2 * dotRadius) / 2

  const part = await api.part.create()
  const ei = await api.part.entityInjection({ id: part })

  // body
  const basic = await api.solid.box({ id: ei, width, height, length })
  const subBox = await api.solid.box({
    id: ei,
    width: width - 2 * thickness,
    height: height - thickness,
    length: length - 2 * thickness,
    translation: [0, 0, -thickness],
  })
  await api.solid.subtraction({ id: ei, target: basic, tools: [subBox] })

  // dots
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const dot = await api.solid.cylinder({
        id: ei,
        diameter: 2 * dotRadius,
        height: dotHeight,
        translation: [
          length / 2 - dotGap - j * (2 * dotGap),
          width / 2 - dotGap - i * (2 * dotGap),
          (height + dotHeight) / 2,
        ],
      })
      await api.solid.union({ id: ei, target: basic, tools: [dot] })
    }
  }

  // tubes
  if (rows > 1 && columns > 1) {
    const tube = await api.solid.cylinder({ id: ei, diameter: 2 * tubeRadius, height: tubeHeight })
    const subCyl = await api.solid.cylinder({
      id: ei,
      diameter: 2 * (tubeRadius - thickness),
      height: tubeHeight,
    })
    await api.solid.subtraction({ id: ei, target: tube, tools: [subCyl] })
    for (let i = 0; i < columns - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const copy = await api.solid.copy({
          id: ei,
          target: tube,
          translation: [
            length / 2 - 2 * dotGap - j * (2 * dotGap),
            width / 2 - 2 * dotGap - i * (2 * dotGap),
            -thickness / 2,
          ],
        })
        await api.solid.union({ id: ei, target: basic, tools: [copy] })
      }
    }
    await api.solid.deleteSolid({ id: ei, ids: [tube] })
  }
  return [basic]
}

const update: Update = async (model, productId, params) => {
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0]) || check(paramsMap[1])) {
    await model.api.common.clear()
    return create(model, params)
  }
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
        color: new THREE.Color('rgb(70, 0, 70)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export default { create, update, getBufferGeom, paramsMap }
