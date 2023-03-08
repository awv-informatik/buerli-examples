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
  const [nutBoltAsm] = await api.loadProduct(arraybuffer, 'ofb', { ident: 'NutBoltProduct'})

  api.setExpressions({
    partId: 'BoltProduct',
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })

  api.setExpressions({ partId: 'NutProduct', members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  /* LBracket */
  const lBracket = await api.loadProduct(arraybuffer2, 'ofb', { ident: 'LBracketProduct'})

  api.setExpressions({
    partId: 'LBracketProduct',
    members: [
      { name: 'Rod_Hole_Diameter', value: rodDiameter },
      { name: 'Hole_Diameter', value: shaftDiameter },
    ],
  })

  const [lBracketRef1] = await api.addNodes({
    productId: lBracket[0],
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  })
  const wcsIdLBracketOrigin = await api.getWorkGeometry(lBracketRef1, CCClasses.CCWorkCoordSystem, 'WCS_Origin')

  /* LBracket at origin */
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    {
      matePath: [lBracketRef1],
      wcsId: wcsIdLBracketOrigin[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC',
  )

  await api.addNodes({
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  }, {
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  }, {
    productId: nutBoltAsm,
    ownerId: lBracketAsm,
    transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
  })

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
