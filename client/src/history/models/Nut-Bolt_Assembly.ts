import { FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory } from '@buerli.io/headless'
import arraybuffer from '../../shared/resources/Bolt.of1'
import arraybuffer2 from '../../shared/resources/Nut.of1'
import { ParamType } from '../store'

export const create = async (api: ApiHistory, params?: ParamType) => {
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 10
  const shaftLength = 37
  const nutBoltAsm = await api.createRootAssembly('NutBolt_Asm')

  /* Bolt */
  const bolt = await api.loadProduct(arraybuffer, 'of1')

  api.setExpressions(
    bolt,
    { name: 'Shaft_Length', value: shaftLength },
    { name: 'Shaft_Diameter', value: shaftDiameter },
  )
  const boltRefId = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])

  const wcsIdBoltNut = await api.getWorkCoordSystem(boltRefId, 'WCS_Nut')
  const wcsIdOrigin = await api.getWorkCoordSystem(boltRefId, 'WCS_Origin')

  /* Nut */
  const nut = await api.loadProduct(arraybuffer2, 'of1')
  api.setExpressions(nut, { name: 'Hole_Diameter', value: shaftDiameter })
  const nutRefId = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])
  const wcsIdNut = await api.getWorkCoordSystem(nutRefId, 'WCS_Hole_Top')

  /* Bolt at origin */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    { refId: boltRefId, wcsId: wcsIdOrigin[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FOC',
  )

  /* Nut on Bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    { refId: nutRefId, wcsId: wcsIdNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    { refId: boltRefId, wcsId: wcsIdBoltNut[0], flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
    0,
    0,
    0,
    'FC1',
  )
  return nutBoltAsm
}

export default create
