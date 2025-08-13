import { Create, Param, ParamType, Update } from '../../store'
import { BuerliCadFacade } from '@buerli.io/classcad'

export const paramsMap: Param[] = [
  { index: 0, name: 'radius', type: ParamType.Slider, value: 100, step: 5, values: [50, 130] },
  { index: 901, name: 'saveAsOfb', type: ParamType.Button, value: saveOfb }
].sort(
  (a, b) => a.index - b.index,
)

export const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create()
  const top = await api.part.getWorkGeometry({ id: part, name: 'Top' })
  const sketch = await api.sketch.create({ id: part, planeId: top })

  // expressions
  await api.part.expression({
    id: part,
    toCreate: [
      { name: 'circle_Radius', value: 100 },
      { name: 'arc_Radius', value: 'circle_Radius*0.7' },
      { name: 'rectangle_Height', value: 'circle_Radius*0.3' },
      { name: 'offset', value: 'circle_Radius*0.3' },
    ],
  })

  // overall circle
  const circle = await api.sketch.circle({ id: sketch, centerPos: [0, 0, 0], radius: 100 })
  await api.sketch.dimension({
    id: sketch,
    type: 'RADIUS',
    value: '@expr.circle_Radius',
    geomIds: [circle as number],
  })

  // segment bottom
  const line1 = await api.sketch.line({ id: sketch, startPos: [-70, -20, 0], endPos: [70, -30, 0] })
  const arc1 = await api.sketch.arcBy3Points({
    id: sketch,
    startPos: [70, -30, 0],
    endPos: [-70, -20, 0],
    midPos: [-10, -70, 0],
  })
  const points = (await api.sketch.getPoints({ id: circle as number })) as { centerId: number }
  await api.sketch.constraint([
    { id: sketch, type: 'HORIZONTAL', geomIds: [line1 as number] },
    { id: sketch, type: 'MIDPOINT', geomIds: [line1 as number, points.centerId] },
    { id: sketch, type: 'CONCENTRIC', geomIds: [arc1 as number, circle as number] },
  ])
  await api.sketch.dimension([
    { id: sketch, type: 'RADIUS', value: '@expr.arc_Radius', geomIds: [arc1 as number] },
    { id: sketch, type: 'OFFSET', value: '@expr.offset', geomIds: [line1 as number, points.centerId] },
  ])

  // segment top
  const line2 = await api.sketch.line({ id: sketch, startPos: [-70, 20, 0], endPos: [70, 30, 0] })
  const arc2 = await api.sketch.arcBy3Points({
    id: sketch,
    startPos: [70, 30, 0],
    endPos: [-70, 20, 0],
    midPos: [-10, 70, 0],
  })
  await api.sketch.constraint([
    { id: sketch, type: 'PARALLEL', geomIds: [line1 as number, line2 as number] },
    { id: sketch, type: 'EQUAL_LENGTH', geomIds: [line1 as number, line2 as number] },
    { id: sketch, type: 'EQUAL_RADIUS', geomIds: [arc1 as number, arc2 as number] },
    { id: sketch, type: 'MIDPOINT', geomIds: [line2 as number, points.centerId] },
  ])
  await api.sketch.dimension({ id: sketch, type: 'OFFSET', value: '@expr.offset', geomIds: [line2 as number, points.centerId] })

  // rectangle middle
  const lines = await api.sketch.rectangle({ id: sketch, startPos: [0, 0, 0], endPos: [-50, 20, 0], isCentered: true })
  const points2 = (await api.sketch.getPoints({ id: line1 as number })) as { startId: number; endId: number }
  await api.sketch.constraint({ id: sketch, type: 'COLINEAR', geomIds: [points2.startId, lines[1]] })
  await api.sketch.dimension({
    id: sketch,
    type: 'VERTICAL_DISTANCE',
    value: '@expr.rectangle_Height',
    geomIds: [lines[1]],
  })

  // solid
  const geom = await api.sketch.getGeometry({ id: sketch })
  const extrusion = await api.part.extrusion({ id: part, references: [...geom.lines, ...geom.arcs, ...geom.circles] })
  await api.part.setAppearance({ target: extrusion, color: [125,196,145] })

  return part
}

export const update: Update = async (model, productId, params) => {
  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }

  await model.api.v1.part.updateExpression({
    id: productId,
    toUpdate: [
      { name: 'circle_Radius', value: params.values[0] }
    ],
  })
  return productId
}

async function saveOfb(model: BuerliCadFacade) {
  const ofbData = await model.api.v1.common.save({ format: 'OFB' })
  if (ofbData) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([ofbData.content], { type: 'application/octet-stream' }))
    link.download = `Sketch4.ofb`
    link.click()
  }
}

export default { create, update, paramsMap }
