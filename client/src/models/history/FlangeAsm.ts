/* eslint-disable max-lines */
import { Buffer } from 'buffer'
import flangeAB from '../../resources/history/Flange/FlangePrt.ofb?buffer'
import boltAB from '../../resources/history/Flange/Bolt_M22.ofb?buffer'
import nutAB from '../../resources/history/Flange/Nut_M22.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const flangeData = Buffer.from(flangeAB).toString('base64')
const boltData = Buffer.from(boltAB).toString('base64')
const nutData = Buffer.from(nutAB).toString('base64')

export const create: Create = async (model, param) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1

  // Create the root assembly
  const root = await assemblyApi.create({ name: 'FlangeAsm' })

  // Load all needed products
  const { id: flange } = await assemblyApi.loadProduct({ data: flangeData, format: 'OFB', encoding: 'base64' })
  const { id: bolt } = await assemblyApi.loadProduct({ data: boltData, format: 'OFB', encoding: 'base64' })
  const { id: nut } = await assemblyApi.loadProduct({ data: nutData, format: 'OFB', encoding: 'base64' })

  if (flange && bolt && nut) {
    // Get all necessary work coordinate systems
    const wcsCenter = await partApi.getWorkGeometry({ id: flange, name: 'WCSCenter' })
    const wcsHole1Top = await partApi.getWorkGeometry({ id: flange, name: 'WCSBoltHoleTop' })
    const wcsBoltHead = await partApi.getWorkGeometry({ id: bolt, name: 'WCSHead' })
    const wcsNut = await partApi.getWorkGeometry({ id: nut, name: 'WCSNut' })

    // Add the products as instances to the root assembly
    const res = await assemblyApi.instance([
      {
        productId: flange,
        ownerId: root,
      },
      {
        productId: flange,
        ownerId: root,
      },
      {
        productId: bolt,
        ownerId: root,
      },
      {
        productId: nut,
        ownerId: root,
      },
    ])

    const [flange1Instance, flange2Instance, boltInstance, nutInstance] = res as number[]

    // Create all the constraints
    await assemblyApi.fastenedOrigin({
      id: root,
      mate1: {
        path: [flange1Instance],
        csys: wcsCenter,
      },
      name: 'FOCFlange1',
    })

    await assemblyApi.fastened([
      {
        id: root,
        mate1: {
          path: [flange1Instance],
          csys: wcsCenter,
        },
        mate2: {
          path: [flange2Instance],
          csys: wcsCenter,
          flip: '-Z',
          reorient: '180',
        },
        name: 'FCFlange1Flange2',
      },
      {
        id: root,
        mate1: {
          path: [flange1Instance],
          csys: wcsHole1Top,
        },
        mate2: {
          path: [boltInstance],
          csys: wcsBoltHead,
        },
        name: 'FCFlange1Bolt',
      },
      {
        id: root,
        mate1: {
          path: [flange2Instance],
          csys: wcsHole1Top,
        },
        mate2: {
          path: [nutInstance],
          csys: wcsNut,
          flip: '-Z',
        },
        name: 'FCFlange2Nut',
      },
    ])
    return root
  }
}

export default { create, paramsMap }
