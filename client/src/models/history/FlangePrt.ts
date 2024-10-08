import { ApiHistory, History } from '@buerli.io/headless'
import {
  BooleanOperationType,
  ChamferType,
  WorkAxisType,
  WorkCoordSystemType,
} from '@buerli.io/classcad'
import { Create, Param } from '../../store'
import { GraphicType } from '@buerli.io/core'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params, options) => {
  const api = apiType as ApiHistory

  // Initial create
  const rotation = { x: 0, y: 0, z: 0 }
  const offset = { x: 0, y: 0, z: 0 }
  const origin = { x: 0, y: 0, z: 0 }
  const zDir = { x: 0, y: 0, z: 1 }
  const holeOffset = 'ExpressionSet.upperCylDiam / 2 + ExpressionSet.thickness'
  const holeOffset1Bottom = { x: 0, y: holeOffset, z: 0 }
  const holeOffset1Top = { x: 0, y: holeOffset, z: 'ExpressionSet.thickness' }

  const flange = await api.createPart('Flange')

  if (flange) {
    // Expressions
    api.createExpressions(
      flange,
      { name: 'thickness', value: 30 },
      { name: 'upperCylDiam', value: 190 },
      { name: 'upperCylHoleDiam', value: 'upperCylDiam - thickness' },
      { name: 'flangeHeight', value: 110 },
      { name: 'baseCylDiam', value: 'upperCylDiam + 4 * thickness' },
      { name: 'holeOffset', value: '(upperCylDiam / 2) + thickness' },
      { name: 'holeCount', value: 4 },
      { name: 'holeAngle', value: 'C:PI * 2 / holeCount' },
    )

    // Create geometry
    const wcsCenter = api.createWorkCoordSystem(
      flange,
      WorkCoordSystemType.WCS_CUSTOM,
      [],
      offset,
      rotation,
      false,
      'WCSCenter',
    )
    const baseCyl = api.cylinder(
      flange,
      [wcsCenter],
      'ExpressionSet.baseCylDiam',
      'ExpressionSet.thickness',
    )
    const upperCyl = api.cylinder(
      flange,
      [wcsCenter],
      'ExpressionSet.upperCylDiam',
      'ExpressionSet.flangeHeight',
    )
    const flangeSolid1 = api.boolean(flange, BooleanOperationType.UNION, [baseCyl, upperCyl])
    const subCylFlange = api.cylinder(
      flange,
      [wcsCenter],
      'ExpressionSet.upperCylHoleDiam',
      'ExpressionSet.flangeHeight',
    )
    await api.boolean(flange, BooleanOperationType.SUBTRACTION, [flangeSolid1, subCylFlange])

    options?.onSelect()
    const selections = await api.selectGeometry([GraphicType.ARC, GraphicType.CIRCLE], 2)
    options?.onResume()
    const flange2 = await api.chamfer(flange, ChamferType.EQUAL_DISTANCE, selections.map(sel => sel.graphicId), 2, 2, 45)

    const wcsHole1Bottom = api.createWorkCoordSystem(
      flange,
      WorkCoordSystemType.WCS_CUSTOM,
      [],
      holeOffset1Bottom,
      rotation,
      false,
      'WCSBoltHoleBottom',
    )
    const subCylHole1 = await api.cylinder(flange, [wcsHole1Bottom], 30, 50)

    options?.onSelect()
    const selections2 = await api.selectGeometry([GraphicType.ARC, GraphicType.CIRCLE])
    options?.onResume()
    const waCenter = await api.createWorkAxis(
      flange,
      WorkAxisType.WA_CURVE,
      selections2.map(sel => sel.graphicId),
      origin,
      zDir,
      false,
      'WACenter',
    )
    const pattern = await api.circularPattern(flange, [subCylHole1], [waCenter], {
      inverted: 0,
      angle: 'ExpressionSet.holeAngle',
      count: 'ExpressionSet.holeCount',
      merged: 1,
    })

    await api.boolean(flange, BooleanOperationType.SUBTRACTION, [flange2, pattern])
    await api.createWorkCoordSystem(
      flange,
      WorkCoordSystemType.WCS_CUSTOM,
      [],
      holeOffset1Top,
      rotation,
      false,
      'WCSBoltHoleTop',
    )
    
    return flange
  }
}

export const cad = new History()

export default { create, paramsMap, cad }
