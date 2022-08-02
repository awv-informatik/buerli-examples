/* eslint-disable max-lines */
import { FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import flangeAB from '../../resources/history/FlangePrt.of1'
import boltAB from '../../resources/history/Bolt_M22.of1'
import nutAB from '../../resources/history/Nut_M22.of1'
import { Create, Param } from '../../store'

const origin = { x: 0, y: 0, z: 0 }
const xDir = { x: 1, y: 0, z: 0 }
const yDir = { x: 0, y: 1, z: 0 }
let zDir = { x: 0, y: 0, z: 1 }

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, param) => {
  const api = apiType as ApiHistory

  // Create the root assembly
  const root = await api.createRootAssembly('FlangeAsm')

  // Load all needed products
  const flange = await api.loadProduct(flangeAB, 'of1')
  const bolt = await api.loadProduct(boltAB, 'of1')
  const nut = await api.loadProduct(nutAB, 'of1')

  if (flange && bolt && nut) {

    // Get all necessary work coordinate systems
    const wcsCenter = await api.getWorkCoordSystem(flange[0], 'WCSCenter')
    const wcsHole1Top = await api.getWorkCoordSystem(flange[0], 'WCSBoltHoleTop')
    const wcsBoltHead = await api.getWorkCoordSystem(bolt[0], 'WCSHead')
    const wcsNut = await api.getWorkCoordSystem(nut[0], 'WCSNut')
  
    // Add the products as nodes to the root assembly
    const flange1Node = await api.addNode(flange[0], root, [origin, xDir, yDir])
    const flange2Node = await api.addNode(flange[0], root, [origin, xDir, yDir])
    const boltNode = await api.addNode(bolt[0], root, [origin, xDir, yDir])
    const nutNode = await api.addNode(nut[0], root, [origin, xDir, yDir])

    // Create all the constraints
    await api.createFastenedOriginConstraint(
      root,
      {
        matePath: [flange1Node],
        wcsId: wcsCenter[0],
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
        wcsId: wcsCenter[0],
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      {
        matePath: [flange2Node],
        wcsId: wcsCenter[0],
        flip: FlipType.FLIP_Z_INV,
        reoriented: ReorientedType.REORIENTED_180,
      },
      0,0,0, 'FCFlange1Flange2'
    )

    await api.createFastenedConstraint(
      root,
      {
        matePath: [flange1Node],
        wcsId: wcsHole1Top[0],
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      {
        matePath: [boltNode],
        wcsId: wcsBoltHead[0],
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      0,0,0, 'FCFlange1Bolt'
    )

    await api.createFastenedConstraint(
      root,
      {
        matePath: [flange2Node],
        wcsId: wcsHole1Top[0],
        flip: FlipType.FLIP_Z,
        reoriented: ReorientedType.REORIENTED_0,
      },
      {
        matePath: [nutNode],
        wcsId: wcsNut[0],
        flip: FlipType.FLIP_Z_INV,
        reoriented: ReorientedType.REORIENTED_0,
      },
      0,0,0, 'FCFlange2Nut'
    )
    return root
  }
}

export const cad = new history()

export default { create, paramsMap, cad }