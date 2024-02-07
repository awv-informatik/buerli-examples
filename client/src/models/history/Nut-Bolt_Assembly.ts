import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, History } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/As1/Bolt.ofb?buffer'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb?buffer'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 10
  const shaftLength = 37
  const nutBoltAsm = await api.createRootAssembly('NutBolt_Asm')

  /* Bolt */
  const bolt = await api.loadProduct(arraybuffer, 'ofb')

  api.setExpressions({
    partId: bolt[0],
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })
  const [boltRefId] = await api.addInstances({
    productId: bolt[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })

  const wcsIdBoltNut = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Nut')
  const wcsIdOrigin = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCSys, 'WCS_Origin')

  /* Nut */
  const nut = await api.loadProduct(arraybuffer2, 'ofb')
  api.setExpressions({ partId: nut[0], members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })
  const [nutRefId] = await api.addInstances({
    productId: nut[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })
  const wcsIdNut = await api.getWorkGeometry(nutRefId, CCClasses.CCWorkCSys, 'WCS_Hole_Top')

  /* Bolt at origin */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    {
      matePath: [boltRefId],
      wcsId: wcsIdOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC',
  )

  /* Nut on Bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    {
      matePath: [nutRefId],
      wcsId: wcsIdNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [boltRefId],
      wcsId: wcsIdBoltNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC1',
  )
  return nutBoltAsm
}

export const cad = new History()

export default { create, paramsMap, cad }
