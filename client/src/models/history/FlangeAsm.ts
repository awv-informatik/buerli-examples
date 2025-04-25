/* eslint-disable max-lines */
import flangeAB from '../../resources/history/Flange/FlangePrt.ofb?buffer'
import boltAB from '../../resources/history/Flange/Bolt_M22.ofb?buffer'
import nutAB from '../../resources/history/Flange/Nut_M22.ofb?buffer'
import { Create, Param } from '../../store'
import { Buffer } from 'buffer'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const flangeData = Buffer.from(flangeAB).toString('utf-8') // TODO: how to support ArrayBuffer in the API?
const boltData = Buffer.from(boltAB).toString('utf-8') // TODO: how to support ArrayBuffer in the API?
const nutData = Buffer.from(nutAB).toString('utf-8') // TODO: how to support ArrayBuffer in the API?

export const create: Create = async (model, param) => {
  const { assembly: assemblyApi, part: partApi } = model.api.v1

  // Create the root assembly
  const { result: root } = await assemblyApi.create({ name: 'FlangeAsm' })

  // Load all needed products
  const {
    result: { id: flange },
  } = await assemblyApi.loadProduct({ data: flangeData, format: 'OFB' })
  const {
    result: { id: bolt },
  } = await assemblyApi.loadProduct({ data: boltData, format: 'OFB' })
  const {
    result: { id: nut },
  } = await assemblyApi.loadProduct({ data: nutData, format: 'OFB' })

  if (flange && bolt && nut) {
    // Get all necessary work coordinate systems
    const { result: wcsCenter } = await partApi.getWorkGeometry({ id: flange, name: 'WCSCenter' })
    const { result: wcsHole1Top } = await partApi.getWorkGeometry({ id: flange, name: 'WCSBoltHoleTop' })
    const { result: wcsBoltHead } = await partApi.getWorkGeometry({ id: bolt, name: 'WCSHead' })
    const { result: wcsNut } = await partApi.getWorkGeometry({ id: nut, name: 'WCSNut' })

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

    const [flange1Instance, flange2Instance, boltInstance, nutInstance] = res.result as number[]

    // Create all the constraints
    await assemblyApi.fastenedOrigin({
      id: root,
      mate1: {
        matePath: [flange1Instance],
        wcsId: wcsCenter,
      },
      name: 'FOCFlange1',
    })

    await assemblyApi.fastened([
      {
        id: root,
        mate1: {
          matePath: [flange1Instance],
          wcsId: wcsCenter,
        },
        mate2: {
          matePath: [flange2Instance],
          wcsId: wcsCenter,
        },
        name: 'FCFlange1Flange2',
      },
      {
        id: root,
        mate1: {
          matePath: [flange1Instance],
          wcsId: wcsHole1Top,
        },
        mate2: {
          matePath: [boltInstance],
          wcsId: wcsBoltHead,
        },
        name: 'FCFlange1Bolt',
      },
      {
        id: root,
        mate1: {
          matePath: [flange2Instance],
          wcsId: wcsHole1Top,
        },
        mate2: {
          matePath: [nutInstance],
          wcsId: wcsNut,
          flipType: '-Z',
        },
        name: 'FCFlange2Nut',
      },
    ])
    return root
  }
}

export default { create, paramsMap }
