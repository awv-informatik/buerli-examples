import { Create, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const part = await api.part.create()
  const eI = await api.part.entityInjection({ id: part })
  const shape = await api.curve.shape({ id: eI })

  await api.curve.advancedPolyline({
    id: shape,
    pld: [
      { xa: 0, ya: 0 },
      { xa: 80, ya: 0 },
      { ya: 10, a: (135 / 180) * Math.PI },
      { xr: -10, yr: 0 },
      { xr: 0, yr: 30 },
      { xr: -40, yr: 0 },
      { xr: 0, yr: -30 },
      { xr: -10, yr: 0 },
    ],
    close: true,
  })

  const extrusion = await api.solid.extrusion({ id: eI, direction: [0, 0, 30], curves: shape })

  const cyl = await api.solid.cylinder({ id: eI, height: 40, diameter: 40 })
  await api.solid.translation({ id: eI, target: cyl, translation: [40, 40, 20] })

  const cyl2 = await api.solid.cylinder({ id: eI, height: 40, diameter: 20 })
  await api.solid.translation({ id: eI, target: cyl2, translation: [40, 40, 20] })

  const union = await api.solid.union({ id: eI, target: extrusion, tools: [cyl] })
  const subtraction = await api.solid.subtraction({ id: eI, target: union.target, tools: [cyl2] })
  const slice = await api.solid.slice({
    id: eI,
    target: subtraction.target,
    originPos: [40, 40, 20],
    normal: [0, 1, 0],
    keepBoth: false,
  })

  return slice.target
}

export default { create, paramsMap }
