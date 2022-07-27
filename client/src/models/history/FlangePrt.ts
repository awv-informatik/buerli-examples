import { ApiHistory, history } from "@buerli.io/headless"
import { BooleanOperationType, BrepElemType, ChamferType, WorkAxisType, WorkCoordSystemType } from "@buerli.io/classcad"
import { Api, Create } from "../../store"

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  // Initial create
  const rotation = { x: 0, y: 0, z: 0 }
  const offset = { x: 0, y: 0, z: 0 }
  const origin = { x: 0, y: 0, z: 0 }
  const zDir = { x: 0, y: 0, z: 1 }
  const thickness = 30
  const upperCylDiam = 190
  const holeOffset = (upperCylDiam / 2) + thickness
  // const holeOffset1Bottom = '{ 0, ExpressionSet.holeOffset, 0 }'
  // const holeOffset1Top = '{ 0, ExpressionSet.holeOffset, ExpressionSet.thickness }'    
  const holeOffset1Bottom = { x: 0, y: holeOffset, z: 0 }
  const holeOffset1Top = { x: 0, y: holeOffset, z: thickness }
  
  const flange = await api.createPart('Flange')
  
  if (flange) {
    // Expressions
    api.createExpressions(flange, 
      { name: "thickness", value: 30 },
      { name: "upperCylDiam", value: 190 },
      { name: "upperCylHoleDiam", value: "upperCylDiam - thickness"},
      { name: "upperCylHeight", value: 110},
      { name: "baseCylDiam", value: "upperCylDiam + 4 * thickness"},
      { name: "holeOffset", value: "(upperCylDiam / 2) + thickness"}
    )

    // Create geometry
    const wcsCenter = api.createWorkCoordSystem(flange, WorkCoordSystemType.WCS_CUSTOM, [], [], offset, rotation, 0, false, 'WCSCenter')
    const baseCyl = api.cylinder(flange, [wcsCenter], "ExpressionSet.baseCylDiam", "ExpressionSet.thickness")
    const upperCyl = api.cylinder(flange, [wcsCenter], "ExpressionSet.upperCylDiam", "ExpressionSet.upperCylHeight")
    const flangeSolid1 = api.boolean(flange, BooleanOperationType.UNION, [baseCyl, upperCyl])
    const subCylFlange = api.cylinder(flange, [wcsCenter], "ExpressionSet.upperCylHoleDiam", "ExpressionSet.upperCylHeight")
    await api.boolean(flange, BooleanOperationType.SUBTRACTION, [flangeSolid1, subCylFlange])

    const edges1 = await api.findOrSelect(flange, BrepElemType.EDGE, 2, null)
    const flange2 = await api.chamfer(flange, ChamferType.EQUAL_DISTANCE, edges1, 2, 2, 45)

    const wcsHole1Bottom = api.createWorkCoordSystem(flange, WorkCoordSystemType.WCS_CUSTOM, [], [], holeOffset1Bottom, rotation, 0, false, 'WCSBoltHoleBottom')
    const subCylHole1 = await api.cylinder(flange, [wcsHole1Bottom], 30, 50)

    const edgeId8 = await api.findOrSelect(flange, BrepElemType.EDGE, 1, null)
    const waCenter = await api.createWorkAxis(flange, WorkAxisType.WA_CURVE, edgeId8, origin, zDir, false, 'WACenter')
    const pattern = await api.circularPattern(flange, [subCylHole1], [waCenter], { inverted: 0, angle: Math.PI / 2, count: 4, merged: 1})

    await api.boolean(flange, BooleanOperationType.SUBTRACTION, [flange2, pattern] )
    await api.createWorkCoordSystem(flange, WorkCoordSystemType.WCS_CUSTOM, [], [], holeOffset1Top, rotation, 0, false, 'WCSBoltHoleTop')
    return flange
  }
}

export const cad = new history()

export default { create, cad }