import { Create, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const part = await api.part.create()

  const box = await api.part.box({ id: part, length: 50, height: 40, width: 40 })
  let workPlane = await api.part.workPlane({ id: part, position: [50, 20, 20], normal: [1, 0, 1] })
  const slice = await api.part.slice({ id: part, targets: [box], reference: workPlane, inverted: true })
  
  workPlane = await api.part.getWorkGeometry({ id: part, name: 'Front' })
  let sketch = await api.part.sketch({ id: part, planeId: workPlane })
  await api.sketch.setReferences({ id: sketch, invertPlane: true })
  let res = await api.sketch.geometry({
    id: sketch,
    lines: [
      { startPos: [50, 10, 0], endPos: [30, 10, 0] },
      { startPos: [30, 10, 0], endPos: [30, 20, 0] },
      { startPos: [30, 20, 0], endPos: [20, 20, 0] },
      { startPos: [20, 20, 0], endPos: [20, 30, 0] },
      { startPos: [20, 30, 0], endPos: [10, 30, 0] },
      { startPos: [10, 30, 0], endPos: [10, 40, 0] },
      { startPos: [10, 40, 0], endPos: [50, 40, 0] },
      { startPos: [50, 40, 0], endPos: [50, 10, 0] },
    ],
  })

  let extrusion = await api.part.extrusion({ id: part, references: res.lines, limit2: -30 })
  const subtraction = await api.part.boolean({ id: part, type: 'SUBTRACTION', target: slice, tools: [extrusion] })
  
  workPlane = await api.part.getWorkGeometry({ id: part, name: 'Top' })
  sketch = await api.part.sketch({ id: part, planeId: workPlane })
  res = await api.sketch.geometry({
    id: sketch,
    lines: [
      { startPos: [30, 0, 0], endPos: [40, 30, 0] },
      { startPos: [40, 30, 0], endPos: [30, 30, 0] },
      { startPos: [30, 30, 0], endPos: [30, 0, 0] },
    ],
  })

  extrusion = await api.part.extrusion({ id: part, references: res.lines, limit2: 20 })
  const union = await api.part.boolean({ id: part, target: subtraction, tools: [extrusion] })
  await api.part.setAppearance({ target: union, color: [125, 363, 39], transparency: 0.75 })

  return part
}

export default { create, paramsMap }
