import { ReorientedType } from '@buerli.io/classcad'
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
  const fileBolt = new File(['Bolt.of1'], 'Bolt.of1', { type: 'application/x-binary' })
  const bolt = await api.loadProduct(fileBolt, arraybuffer)

  api.setExpressions(
    bolt,
    { name: 'Shaft_Length', value: shaftLength },
    { name: 'Shaft_Diameter', value: shaftDiameter },
  )
  const boltRefId = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])

  const wcsIdBoltNut = await api.getWorkCoordSystem(boltRefId, 'WCS_Nut')
  const wcsIdOrigin = await api.getWorkCoordSystem(boltRefId, 'WCS_Origin')

  /* Nut */
  const fileNut = new File(['Nut.of1'], 'Nut.of1', { type: 'application/x-binary' })
  const nut = await api.loadProduct(fileNut, arraybuffer2)
  api.setExpressions(nut, { name: 'Hole_Diameter', value: shaftDiameter })
  const nutRefId = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])
  const wcsIdNut = await api.getWorkCoordSystem(nutRefId, 'WCS_Hole_Top')

  /* Bolt at origin */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    { refId: boltRefId, wcsId: wcsIdOrigin[0] },
    0,
    0,
    0,
    0,
    ReorientedType.REORIENTED_0,
    'FOC',
  )

  /* Nut on Bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    { refId: nutRefId, wcsId: wcsIdNut[0] },
    { refId: boltRefId, wcsId: wcsIdBoltNut[0] },
    0,
    0,
    0,
    0,
    ReorientedType.REORIENTED_0,
    'FC1',
  )
  return nutBoltAsm
}

export default create
