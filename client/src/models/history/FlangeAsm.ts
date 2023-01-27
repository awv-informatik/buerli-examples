/* eslint-disable max-lines */
import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import flangeAB from '../../resources/history/Flange/FlangePrt.ofb'
import boltAB from '../../resources/history/Flange/Bolt_M22.ofb'
import nutAB from '../../resources/history/Flange/Nut_M22.ofb'
import { Create, Param } from '../../store'

const origin = { x: 0, y: 0, z: 0 }
const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, param) => {
  const api = apiType as ApiHistory

  // Create the root assembly
  const root = await api.createRootAssembly('FlangeAsm')

  // Load all needed products
  const [flange] = await api.loadProduct(flangeAB, 'ofb')
  const [bolt] = await api.loadProduct(boltAB, 'ofb')
  const [nut] = await api.loadProduct(nutAB, 'ofb')

  if (flange && bolt && nut) {
    // Get all necessary work coordinate systems
    const [wcsCenter] = await api.getWorkGeometry(flange, CCClasses.CCWorkCoordSystem, 'WCSCenter')
    const [wcsHole1Top] = await api.getWorkGeometry(flange, CCClasses.CCWorkCoordSystem, 'WCSBoltHoleTop')
    const [wcsBoltHead] = await api.getWorkGeometry(bolt, CCClasses.CCWorkCoordSystem, 'WCSHead')
    const [wcsNut] = await api.getWorkGeometry(nut, CCClasses.CCWorkCoordSystem, 'WCSNut')

    // Add the products as nodes to the root assembly
    const [flange1Node, flange2Node, boltNode, nutNode] = await api.addNodes(
      {
        productId: flange,
        ownerId: root,
        transformation: [origin, xDir, yDir],
      },
      {
        productId: flange,
        ownerId: root,
        transformation: [origin, xDir, yDir],
      },
      {
        productId: bolt,
        ownerId: root,
        transformation: [origin, xDir, yDir],
      },
      {
        productId: nut,
        ownerId: root,
        transformation: [origin, xDir, yDir],
      },
    )

    // Create all the constraints
    await api.createFastenedOriginConstraint(
      root,
      {
        matePath: [flange1Node],
        wcsId: wcsCenter,
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      0,
      0,
      0,
      'FOCFlange1',
    )

    await api.createFastenedConstraint(
      root,
      {
        matePath: [flange1Node],
        wcsId: wcsCenter,
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      {
        matePath: [flange2Node],
        wcsId: wcsCenter,
        flip: FlipType.FLIP_Z_INV,
        reoriented: ReorientedType.REORIENTED_180,
      },
      0,
      0,
      0,
      'FCFlange1Flange2',
    )

    await api.createFastenedConstraint(
      root,
      {
        matePath: [flange1Node],
        wcsId: wcsHole1Top,
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      {
        matePath: [boltNode],
        wcsId: wcsBoltHead,
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      0,
      0,
      0,
      'FCFlange1Bolt',
    )

    await api.createFastenedConstraint(
      root,
      {
        matePath: [flange2Node],
        wcsId: wcsHole1Top,
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      {
        matePath: [nutNode],
        wcsId: wcsNut,
        flip: FlipType.FLIP_Z_INV,
        reoriented: ReorientedType.REORIENTED_0,
      },
      0,
      0,
      0,
      'FCFlange2Nut',
    )
    return root
  }
}

export const cad = new history()

export default { create, paramsMap, cad }
