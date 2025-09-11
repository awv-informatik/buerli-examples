import { Create, Param } from '../../store'

const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const part = await api.part.create()
  const entityInjection = await api.part.entityInjection({ id: part, name: 'SolidContainer' })
  const shape = await api.curve.shape({ id: entityInjection })

  await api.curve.polyline2d({
    id: shape,
    points: [
      [0, 0, 0],
      [0, 4, 0],
      [2.6, 4, 0],
      [6.8, 8.2, 0],
      [2.5, 8.2, 0],
      [2.5, 10, 0],
      [10, 10, 0],
      [10, 2.5, 0],
      [8.2, 2.5, 0],
      [8.2, 6.8, 0],
      [4, 2.6, 0],
      [4, 0, 0],
    ],
    bulges: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    close: true,
  })

  await api.solid.extrusion({ id: entityInjection, curves: shape, direction: [0, 0, 100] })
  const zAxis = await api.part.getWorkGeometry({ id: part, name: 'ZAxis' })
  const circularPattern = await api.part.circularPattern({
    id: part,
    targets: [{ id: entityInjection, indices: [1] }],
    references: [zAxis],
    angle: '90g',
    count: 4,
    merged: true,
  })


  const entityInjection2 = await api.part.entityInjection({ id: part, name: 'SolidContainer2' })
  const cPSolids = await api.solid.getSolidFromFeature({ id: entityInjection2, targets: [circularPattern] });
  const slice = await api.solid.slice({
    id: entityInjection2,
    target: cPSolids[0],
    originPos: [0, 0, 50],
    normal: [0, 1, 1],
  })

  const translation = await api.solid.translation({ id: entityInjection2, target: slice, translation: [0, 0, -50] })
  let rotation = await api.solid.rotation({ id: entityInjection2, target: translation, rotation: [-Math.PI/2, 0, 0] })
  rotation = await api.solid.rotation({ id: entityInjection2, target: rotation, rotation: [0, Math.PI, 0] })
  await api.solid.translation({ id: entityInjection2, target: rotation, translation: [0, 0, 50] })

  return part
}

export default { create, paramsMap }
