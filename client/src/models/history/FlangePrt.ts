import { ScgGraphicType } from '@buerli.io/classcad'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (model, params, options) => {
  const { part: partApi } = model.api.v1

  // Initial create
  const rotation = { x: 0, y: 0, z: 0 }
  const offset = { x: 0, y: 0, z: 0 }
  const origin = { x: 0, y: 0, z: 0 }
  const zDir = { x: 0, y: 0, z: 1 }

  const { result: flange } = await partApi.create({ name: 'Flange' })

  if (flange) {
    // Expressions
    await partApi.expression({
      id: flange,
      toCreate: [
        { name: 'thickness', value: 30 },
        { name: 'upperCylDiam', value: 190 },
        { name: 'upperCylHoleDiam', value: 'upperCylDiam - thickness' },
        { name: 'flangeHeight', value: 110 },
        { name: 'baseCylDiam', value: 'upperCylDiam + 4 * thickness' },
        { name: 'holeOffset', value: '(upperCylDiam / 2) + thickness' },
        { name: 'holeCount', value: 4 },
        { name: 'holeAngle', value: 'C:PI * 2 / holeCount' },
      ],
    })

    // Create geometry
    const { result: wcsCenter } = await partApi.workCSys({
      id: flange,
      offset,
      rotation,
      name: 'WCSCenter',
    })
    const { result: baseCyl } = await partApi.cylinder({
      id: flange,
      references: [wcsCenter],
      diameter: '@expr.baseCylDiam',
      height: '@expr.thickness',
    })
    const { result: upperCyl } = await partApi.cylinder({
      id: flange,
      references: [wcsCenter],
      diameter: '@expr.upperCylDiam',
      height: '@expr.flangeHeight',
    })
    const { result: flangeSolid1 } = await partApi.boolean({
      id: flange,
      type: 'UNION',
      target: baseCyl ,
      tools: [upperCyl ],
    })
    const { result: subCylFlange } = await partApi.cylinder({
      id: flange,
      references: [wcsCenter],
      diameter: '@expr.upperCylHoleDiam',
      height: '@expr.flangeHeight',
    })
    await partApi.boolean({
      id: flange,
      type: 'SUBTRACTION',
      target: flangeSolid1 ,
      tools: [subCylFlange ],
    })

    options?.onSelect()
    const selections = await model.selectGeometry([ScgGraphicType.ARC, ScgGraphicType.CIRCLE], 2)
    options?.onResume()

    const { result: flange2 } = await partApi.chamfer({
      id: flange,
      references: selections.map(sel => sel.graphicId),
    })
    const { result: wcsHole1Bottom } = await partApi.workCSys({
      id: flange,
      offset: '[0, @expr.upperCylDiam / 2 + @expr.thickness, 0]',
      rotation,
      name: 'WCSBoltHoleBottom',
    })
    const { result: subCylHole1 } = await partApi.cylinder({
      id: flange,
      references: [wcsHole1Bottom],
      diameter: 30,
      height: 50,
    })

    options?.onSelect()
    const selections2 = await model.selectGeometry([ScgGraphicType.ARC, ScgGraphicType.CIRCLE])
    options?.onResume()

    const { result: waCenter } = await partApi.workAxis({
      id: flange,
      type: 'CURVE',
      references: selections2.map(sel => sel.graphicId),
      position: origin,
      direction: zDir,
      name: 'WACenter'
    })
    const { result: pattern } = await partApi.circularPattern({
      id: flange,
      targets: [{ id: subCylHole1 }],
      references: [waCenter],
      angle: '@expr.holeAngle',
      count: '@expr.holeCount',
      merged: true
    })
    await partApi.boolean({ id: flange, type: 'SUBTRACTION', target: flange2 , tools: [ pattern ]})
    await partApi.workCSys({
      id: flange,
      offset: '[0, @expr.holeOffset, @expr.thickness]',
      rotation,
      name: 'WCSBoltHoleTop',
    })

    return flange
  }
}

export default { create, paramsMap }
