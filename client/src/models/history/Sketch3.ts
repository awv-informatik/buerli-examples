import { Create, Param, ParamType } from '../../store'
import { BuerliCadFacade } from '@buerli.io/classcad'

export const paramsMap: Param[] = [
  { index: 901, name: 'saveAsOfb', type: ParamType.Button, value: saveOfb },
].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create()
  const top = await api.part.getWorkGeometry({ id: part, name: 'Top' })
  const sketch = await api.sketch.create({ id: part, planeId: top })

  // geometry
  const arc1 = await api.sketch.arcByCenter({
    id: sketch,
    startPos: [0, 30, 0],
    endPos: [0, -30, 0],
    centerPos: [0, 0, 0],
  })
  const geom = await api.sketch.geometry({
    id: sketch,
    lines: [
      { startPos: [0, 30, 0], endPos: [50, 30, 0] },
      { startPos: [50, 30, 0], endPos: [80, -5, 0] },
      { startPos: [80, -5, 0], endPos: [75, -10, 0] },
    ],
  })
  const arc2 = await api.sketch.arcBy3Points({
    id: sketch,
    startPos: [75, -10, 0],
    endPos: [0, -30, 0],
    midPos: [32, -36, 0],
  })

  // constraints
  await api.sketch.constraint({ id: sketch, type: 'TANGENT', geomIds: [arc1 as number, geom.lines[0]] })
  await api.sketch.constraint({ id: sketch, type: 'PERPENDICULAR', geomIds: [geom.lines[1], geom.lines[2]] })
  await api.sketch.constraint({ id: sketch, type: 'TANGENT', geomIds: [arc2 as number, arc1 as number] })

  // dimensions
  await api.sketch.dimension({ id: sketch, type: 'RADIUS', geomIds: [arc1 as number], value: 30 })
  await api.sketch.dimension({ id: sketch, type: 'HORIZONTAL_DISTANCE', geomIds: [geom.lines[0]], value: 50 })
  await api.sketch.dimension({
    id: sketch,
    type: 'ANGLE',
    geomIds: [geom.lines[0], geom.lines[1]],
    value: '135g',
    dimPos: [40, 20, 0],
  })
  await api.sketch.dimension({ id: sketch, type: 'OFFSET', geomIds: [geom.lines[1]], value: 50 })
  await api.sketch.dimension({ id: sketch, type: 'OFFSET', geomIds: [geom.lines[2]], value: 15 })
  await api.sketch.dimension({ id: sketch, type: 'RADIUS', geomIds: [arc2 as number], value: 75 })

  // solid
  await api.part.extrusion({ id: part, references: [...geom.lines, arc1 as number, arc2 as number], limit2: 10 })

  const massProps = await api.part.calculateMassProperties({ id: part })
  console.info('volume: ' + massProps.volume.toFixed(0) )
  return part
}

async function saveOfb(model: BuerliCadFacade) {
  const ofbData = await model.api.v1.common.save({ format: 'OFB' })
  if (ofbData) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([ofbData.content], { type: 'application/octet-stream' }))
    link.download = `Sketch3.ofb`
    link.click()
  }
}

export default { create, paramsMap }
