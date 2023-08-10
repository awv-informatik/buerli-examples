import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/As1/Bolt.ofb'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 15
  const shaftLength = 37

  const nutBoltAsm = await api.createRootAssembly('NutBolt_Asm', { ident: 'NutBoltRoot'})

  /* Bolt */
  await api.loadProduct(arraybuffer, 'ofb', { ident: 'BoltProduct'})

  api.setExpressions({
    partId: 'BoltProduct',
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })
  const [boltRefId] = await api.addInstances({
    productId: 'BoltProduct',
    ownerId: 'NutBoltRoot',
    transformation: [pt0, xDir, yDir],
    options: { ident: 'BoltNode'}
  })

  const wcsIdBoltNut = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Nut')
  const wcsIdBoltOrigin = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Origin')

  /* Nut */
  const nut = await api.loadProduct(arraybuffer2, 'ofb', { ident: 'NutProduct'})

  api.setExpressions({ partId: 'NutProduct', members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  const [nutRefId] = await api.addInstances({
    productId: nut[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })
  const wcsIdNut = await api.getWorkGeometry(nutRefId, CCClasses.CCWorkCoordSystem, 'WCS_Hole_Top')

  /* Set bolt to origin of nut-bolt-assembly */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    {
      matePath: [boltRefId],
      wcsId: wcsIdBoltOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC0',
  )

  /* Nut on Bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    {
      matePath: [boltRefId],
      wcsId: wcsIdBoltNut[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: [nutRefId],
      wcsId: wcsIdNut[0],
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

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene } = await api.createScene(productId, { meshPerGeometry: false })
  console.info(scene)
  return scene
}

export const cad = new history()

export default { create, paramsMap, cad }
