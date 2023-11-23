import { ApiHistory, DimensionType, history } from '@buerli.io/headless'
import {
  BooleanOperationType,
  CCClasses,
  ChamferType,
  OrientationType,
  ViewType,
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
  const thickness = 30
  const upperCylDiam = 190
  const holeOffset = upperCylDiam / 2 + thickness
  const dimensions: DimensionType[] = []
  const holeOffset1Bottom = { x: 0, y: holeOffset, z: 0 }
  const holeOffset1Top = { x: 0, y: holeOffset, z: thickness }

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

   /* options?.onSelect()
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
    )*/
    const diameter: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'Durchmesser1',
        label: 'Durchmesser = ',
        startPos: {x: -155, y: 0, z: 0},
        endPos: {x: 155, y: 0, z: 0},
        textPos: {x: 0, y: 200, z: 0},
        orientation: OrientationType.ALIGNED,
      },
      dxfView: ViewType.TOP,
    }
    dimensions.push(diameter)

    const innerDiameter: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'InnerHole',
        label: 'DurchmesserIH = ',
        startPos: {x: -0.70710678*80, y: -0.70710678*80, z: 110},
        endPos: {x: 0.70710678*80, y: 0.70710678*80, z: 110},
        textPos: {x: 100, y: -150, z: 110},
        orientation: OrientationType.ALIGNED,
      },
      dxfView: ViewType.TOP,
    }
    dimensions.push(innerDiameter)

    const angle: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCAngularDimension,
        name: 'Angle',
        label: 'Angle = ',
        startPos: {x: -1, y: 1, z: 30},
        endPos: {x: 1, y: 1, z: 30},
        cornerPos: {x: 0, y: 0, z: 30},
        textPos: {x: -80, y: 100, z: 30},
      },
      dxfView: ViewType.TOP,
    }
    dimensions.push(angle)

    const radius: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCRadialDimension,
        name: 'Radius',
        label: 'Radius = ',
        centerPos: {x: 0, y: 0, z: 110},
        textPos: {x: -100, y: -100, z: 110},
        radius: 80,
      },
      dxfView: ViewType.TOP,
    }
    dimensions.push(radius)

    const holeDiameter: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'Durchmesser2',
        label: 'Durchmesser = ',
        startPos: {x: -15, y: -125, z: 30},
        endPos: {x: 15, y: -125, z: 30},
        textPos: {x: 0, y: -200, z: 30},
        orientation: OrientationType.HORIZONTAL,
      },
      dxfView: ViewType.TOP,
    }
    dimensions.push(holeDiameter)
    const thicknessDim: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'Dicke',
        label: 'Dicke = ',
        startPos: {x: 0, y: -155, z: 30},
        endPos: {x: 0, y: -155, z: 0},
        textPos: {x: 0, y: -200, z: 70},
        orientation: OrientationType.VERTICAL,
      },
      dxfView: ViewType.RIGHT,
    }
    dimensions.push(thicknessDim)

    const thicknessDimA: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'DickeA',
        label: 'DickeA = ',
        startPos: {x: 0, y: -155, z: 30},
        endPos: {x: 0, y: -155, z: 0},
        textPos: {x: 0, y: -200, z: 70},
        orientation: OrientationType.ALIGNED,
      },
      dxfView: ViewType.RIGHT,
    }
    dimensions.push(thicknessDimA)

    const thicknessDimA1: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'DickeA_Angle',
        label: 'DickeA_Angle = ',
        startPos: {x: 0, y: -155, z: 30},
        endPos: {x: 0, y: -155, z: 0},
        textPos: {x: 0, y: -200, z: 70},
        textAngle: 45*Math.PI/180,
        orientation: OrientationType.ALIGNED,
      },
      dxfView: ViewType.RIGHT,
    }
    dimensions.push(thicknessDimA1)

    const upperCylDiameter: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'Durchmesser2',
        label: 'Durchmesser = ',
        startPos: {x: 0, y: 95, z: 108},
        endPos: {x: 0, y: -95, z: 108},
        textPos: {x: 0, y: 0, z: 150},
        orientation: OrientationType.HORIZONTAL,
      },
      dxfView: ViewType.RIGHT,
    }
    dimensions.push(upperCylDiameter)

    const thicknessDim1: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'Dicke1',
        label: 'Dicke1 = ',
        startPos: {x: 0, y: -155, z: 30},
        endPos: {x: 0, y: -155, z: 0},
        textPos: {x: 0, y: -200, z: 70},
        orientation: OrientationType.HORIZONTAL,
      },
      dxfView: ViewType.RIGHT_90,
    }
    dimensions.push(thicknessDim1)

    const upperCylHeight: DimensionType = {
      productId: flange,
      param: {
        type: CCClasses.CCLinearDimension,
        name: 'Height',
        label: 'Height = ',
        startPos: {x: 0, y: 95, z: 110},
        endPos: {x: 0, y: 95, z: 30},
        textPos: {x: 0, y: 200, z: 70},
        orientation: OrientationType.HORIZONTAL,
      },
      dxfView: ViewType.RIGHT_90,
    }
    dimensions.push(upperCylHeight)

    await api.addDimensions(...dimensions)


    await api.create2DViews(flange, [ViewType.TOP, ViewType.RIGHT, ViewType.RIGHT_90, ViewType.ISO])
    await api.place2DViews(flange, [
      { viewType: ViewType.ISO, vector: { x: 500, y: 500, z: 0 } },
      { viewType: ViewType.RIGHT, vector: { x: 500, y: 0, z: 0 } },
      { viewType: ViewType.RIGHT_90, vector: { x: 1000, y: 0, z: 0 } },
    ])


    const dataDxf = await api.exportDXF(flange)
    if (dataDxf) {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([dataDxf], { type: 'application/octet-stream' }))
      link.download = `FlangeDwg.dxf`
      link.click()
    }






    return flange
  }
}

export const cad = new history()

export default { create, paramsMap, cad }
