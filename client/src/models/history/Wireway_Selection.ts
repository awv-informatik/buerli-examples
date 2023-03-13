import { ApiHistory, history } from '@buerli.io/headless'
import arraybuffer from '../../resources/history/Wireway/WirewayAsm.ofb'
import arraybuffer2 from '../../resources/history/Wireway/Plate.ofb'
import { Create, Param } from '../../store'
import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const root = await api.createRootAssembly('WirewaySelection_Asm', { ident: 'Root' })

  // Plate
  const [plate] = await api.loadProduct(arraybuffer2, 'ofb', { ident: 'plate' })
  const [wcsOriginPlate] = await api.getWorkGeometry(
    plate,
    CCClasses.CCWorkCoordSystem,
    'WCS_Origin',
  )
  const [wcs1Plate] = await api.getWorkGeometry(plate, CCClasses.CCWorkCoordSystem, 'WCS1')
  const [wcs2Plate] = await api.getWorkGeometry(plate, CCClasses.CCWorkCoordSystem, 'WCS2')
  const [wcs3Plate] = await api.getWorkGeometry(plate, CCClasses.CCWorkCoordSystem, 'WCS3')

  // Wireway 1
  const [wireway1] = await api.loadProduct(arraybuffer, 'ofb', { ident: 'wireway1' }) // assembly template
  const [duct1NodeTempl, cover1NodeTempl] = await api.getAssemblyNode(wireway1) // nodes of assembly template
  const [duct1Product, cover1Product] = await api.getProductOfNode([duct1NodeTempl, cover1NodeTempl]) // products from part container
  const [wcsWw1] = await api.getWorkGeometry(duct1Product, CCClasses.CCWorkCoordSystem, 'WCS_Hole')
  await api.setExpressions(
    {
      partId: duct1Product,
      members: [
        { name: 'Breite', value: 40 },
        { name: 'Hoehe', value: 60 },
        { name: 'Laenge', value: 100 },
      ],
    },
    {
      partId: cover1Product,
      members: [
        { name: 'Breite', value: 40 },
        { name: 'Laenge', value: 50 },
      ],
    },
  )

  // Wireway 2
  const [wireway2] = await api.loadProduct(arraybuffer, 'ofb', { ident: 'wireway2' })
  const [duct2NodeTempl, cover2NodeTempl] = await api.getAssemblyNode(wireway2)
  const [duct2Product, cover2Product] = await api.getProductOfNode([duct2NodeTempl, cover2NodeTempl])
  const [wcsWw2] = await api.getWorkGeometry(duct2Product, CCClasses.CCWorkCoordSystem, 'WCS_Hole')
  await api.setExpressions(
    {
      partId: duct2Product,
      members: [
        { name: 'Breite', value: 20 },
        { name: 'Hoehe', value: 40 },
        { name: 'Laenge', value: 100 },
      ],
    },
    {
      partId: cover2Product,
      members: [
        { name: 'Breite', value: 20 },
        { name: 'Laenge', value: 50 },
      ],
    },
  )

  // Wireway 3
  const [wireway3] = await api.loadProduct(arraybuffer, 'ofb', { ident: 'wireway3' })
  const [duct3NodeTempl, cover3NodeTempl] = await api.getAssemblyNode(wireway3)
  const [duct3Product, cover3Product] = await api.getProductOfNode([duct3NodeTempl, cover3NodeTempl])
  const [wcsWw3] = await api.getWorkGeometry(duct3Product, CCClasses.CCWorkCoordSystem, 'WCS_Hole')
  await api.setExpressions(
    {
      partId: duct3Product,
      members: [
        { name: 'Breite', value: 80 },
        { name: 'Hoehe', value: 20 },
        { name: 'Laenge', value: 100 },
      ],
    },
    {
      partId: cover3Product,
      members: [
        { name: 'Breite', value: 80 },
        { name: 'Laenge', value: 50 },
      ],
    },
  )

  const [plateNode, wirewayNode1, wirewayNode2, wirewayNode3 ] = await api.addNodes(
    {
      productId: 'plate',
      ownerId: 'Root',
      transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
      options: { ident: 'plateNode' },
    },
    {
      productId: 'wireway1',
      ownerId: 'Root',
      transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
      options: { ident: 'wirewayNode1' },
    },
    {
      productId: 'wireway2',
      ownerId: 'Root',
      transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
      options: { ident: 'wirewayNode2' },
    },
    {
      productId: 'wireway3',
      ownerId: 'Root',
      transformation: [{ x: 0, y: 0, z: 0 }, xDir, yDir],
      options: { ident: 'wirewayNode3' },
    },
  )
  const [duct1NodeExpTree] = await api.getAssemblyNode(wirewayNode1, 'Kanal')
  const [duct2NodeExpTree] = await api.getAssemblyNode(wirewayNode2, 'Kanal')
  const [duct3NodeExpTree] = await api.getAssemblyNode(wirewayNode3, 'Kanal')

  await api.createFastenedOriginConstraint(
    root,
    {
      matePath: [plateNode],
      wcsId: wcsOriginPlate,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'foc',
  )

  await api.createFastenedConstraint(
    root,
    {
      matePath: [plateNode],
      wcsId: wcs1Plate,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: await api.getMatePath(duct1NodeExpTree),
      wcsId: wcsWw1,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'fc1',
  )

  await api.createFastenedConstraint(
    root,
    {
      matePath: [plateNode],
      wcsId: wcs2Plate,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: await api.getMatePath(duct2NodeExpTree),
      wcsId: wcsWw2,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'fc2',
  )

  await api.createFastenedConstraint(
    root,
    {
      matePath: [plateNode],
      wcsId: wcs3Plate,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    {
      matePath: await api.getMatePath(duct3NodeExpTree),
      wcsId: wcsWw3,
      flip: FlipType.FLIP_X,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'fc3',
  )

  return root
}

export const cad = new history()

export default { create, paramsMap, cad }
