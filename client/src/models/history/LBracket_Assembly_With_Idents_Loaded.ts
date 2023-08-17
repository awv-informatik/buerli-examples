import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/As1/NutBoltAsm.ofb'
import arraybuffer2 from '../../resources/history/As1/LBracket.ofb'
import { Create, Param } from '../../store'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const shaftDiameter = 15
  const shaftLength = 37
  const rodDiameter = 30

  const lBracketAsm = await api.createRootAssembly('LBracket_Asm', { ident: 'LBracketRoot'})

  /* NutBoltAsm */
  await api.loadProduct(arraybuffer, 'ofb', { ident: 'NutBoltProduct'})

  api.setExpressions({
    partId: 'BoltProduct',
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })

  api.setExpressions({ partId: 'NutProduct', members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  /* LBracket */
  await api.loadProduct(arraybuffer2, 'ofb', { ident: 'LBracketProduct'})

  api.setExpressions({
    partId: 'LBracketProduct',
    members: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  const [lBracketRef1] = await api.addInstances({
    productId: 'LBracketProduct',
    ownerId: 'LBracketRoot',
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  })
  const [wcsIdLBracketOrigin] = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Origin')
  const [wcsIdLBracket1] = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole1-Top')
  const [wcsIdLBracket2] = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole2-Top')
  const [wcsIdLBracket3] = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCSys, 'WCS_Hole3-Top')

  /* LBracket at origin */
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracketOrigin,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC',
  )

  const [nutBoltNode1, nutBoltNode2, nutBoltNode3] = await api.addInstances({
    productId: 'NutBoltProduct',
    ownerId: 'LBracketRoot',
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
    name: 'NutBoltNode1Name',
    options: { ident: 'NutBoltNode1'}
  }, {
    productId: 'NutBoltProduct',
    ownerId: 'LBracketRoot',
    transformation: [{ x: 50, y: 0, z: 0 }, xDir, yDir],
    options: { ident: 'NutBoltNode2'}
  }, {
    productId: 'NutBoltProduct',
    ownerId: 'LBracketRoot',
    transformation: [{ x: 100, y: 0, z: 0 }, xDir, yDir],
    options: { ident: 'NutBoltNode3'}
  })

  const [boltNode1] = await api.getInstance(nutBoltNode1, 'Bolt')
  const [boltNode2] = await api.getInstance(nutBoltNode2, 'Bolt')
  const [boltNode3] = await api.getInstance(nutBoltNode3, 'Bolt')
  const [wcsIdBoltHeadShaft] = await api.getWorkGeometry(boltNode1, CCClasses.CCWorkCSys, 'WCS_Head-Shaft')

  /* NutBolt1 on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket1,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: await api.getMatePath(boltNode1),
      wcsId: wcsIdBoltHeadShaft,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC1',
  )

  /* NutBolt2 on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket2,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: await api.getMatePath(boltNode2),
      wcsId: wcsIdBoltHeadShaft,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC2',
  )

  /* NutBolt3 on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracket3,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: await api.getMatePath(boltNode3),
      wcsId: wcsIdBoltHeadShaft,
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FC3',
  )



  return lBracketAsm
}

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene } = await api.createScene(productId, { meshPerGeometry: false })
  console.info(scene)
  return scene
}

export const cad = new history()

export default { create, paramsMap, cad }
