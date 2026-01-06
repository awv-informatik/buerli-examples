import { Create, Param } from '../../store'
import dxfData from '../../resources/history/examplePolylines.json'

type PLine = {
  points: [number, number, number][]
  bulges?: number[]
  normal?: [number, number, number]
  closed?: boolean
}

type DxfJson = {
  name?: string
  PLines: PLine[]
}

const paramsMap: Param[] = [
  /** Add parameters here */
].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create()
  const entityInjection = await api.part.entityInjection({ id: part, name: 'SolidContainer' })
  const shape = await api.curve.shape({ id: entityInjection })
  const data = dxfData as unknown as DxfJson

  // Add *all* polylines from JSON into the *same* shape
  for (const pl of data.PLines) {
    const points = pl.points ?? []
    if (points.length < 2) continue
    const bulges = pl.bulges && pl.bulges.length === points.length ? pl.bulges : new Array(points.length).fill(0)
    await api.curve.polyline2d({
      id: shape,
      points,
      bulges,
      close: Boolean(pl.closed),
    })
  }
  await api.solid.extrusion({ id: entityInjection, curves: shape, direction: [0, 0, 100] })
  return part
}

export default { create, paramsMap }
