import { CCClasses, FlipType, ReorientedType } from '@buerli.io/classcad'
import { ApiHistory, history } from '@buerli.io/headless'
import { Color } from 'three'
import arraybuffer from '../../resources/history/As1/Bolt.ofb'
import arraybuffer2 from '../../resources/history/As1/Nut.ofb'
import arraybuffer4 from '../../resources/history/As1/Plate.ofb'
import { Create, Param } from '../../store'
import { findObjectsByName, setObjectColor } from '../../utils/utils'

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params?) => {
  const api = apiType as ApiHistory

  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  /* Create different variables to control expressions */
  const shaftDiameter = 10
  const shaftLength = 42

  /* Create root assembly */
  const as1Asm = await api.createRootAssembly('Root_Assembly', { ident: 'RootAssembly'})

  const nutBoltAsm = await api.createAssemblyAsTemplate('NutBolt_Asm')

  /* Load Bolt part */
  const bolt = await api.loadProduct(arraybuffer, 'ofb', { ident: 'BoltProduct'})

  /* Set expressions on bolt part (optional) */
  api.setExpressions({
    partId: 'BoltProduct',
    members: [
      { name: 'Shaft_Length', value: shaftLength },
      { name: 'Shaft_Diameter', value: shaftDiameter },
    ],
  })

  /* Add bolt to nut-bolt assembly template */
  const [boltRefId] = await api.addInstances({
    productId: bolt[0],
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of bolt */
  const wcsIdBoltNut = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Nut')
   const wcsIdBoltOrigin = await api.getWorkGeometry(boltRefId, CCClasses.CCWorkCoordSystem, 'WCS_Origin')

  /* Load Nut part */
  await api.loadProduct(arraybuffer2, 'ofb', { ident: 'NutProduct'})

  /* Set expressions on bolt part (optional) */
  api.setExpressions({ partId: 'NutProduct', members: [{ name: 'Hole_Diameter', value: shaftDiameter }] })

  /* Add nut to nut-bolt-assembly template */
  const [nutRefId] = await api.addInstances({
    productId: 'NutProduct',
    ownerId: nutBoltAsm,
    transformation: [pt0, xDir, yDir],
    options: { ident: 'NutNodeInTemplate'}
  })

  /* Get needed workcoordsystems of nut */
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

  /* Set nut on bolt */
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


  await api.addInstances({
    productId: nutBoltAsm,
    ownerId: 'RootAssembly',
    transformation: [{x: 40, y: 60, z: 20}, xDir, yDir],
    options: { ident: 'NutBoltNode1'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'RootAssembly',
    transformation: [{x: 25, y: 75, z: 20}, xDir, yDir],
    options: { ident: 'NutBoltNode2'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'RootAssembly',
    transformation: [{x: 40, y: 90, z: 20}, xDir, yDir],
    options: { ident: 'NutBoltNode3'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'RootAssembly',
    transformation: [{x: 140, y: 60, z: 20}, xDir, yDir],
    options: { ident: 'NutBoltNode4'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'RootAssembly',
    transformation: [{x: 155, y: 75, z: 20}, xDir, yDir],
    options: { ident: 'NutBoltNode5'}
  }, {
    productId: nutBoltAsm,
    ownerId: 'RootAssembly',
    transformation: [{x: 140, y: 90, z: 20}, xDir, yDir],
    options: { ident: 'NutBoltNode6'}
  })

  /* Load Plate part */
  const plate = await api.loadProduct(arraybuffer4, 'ofb')

  /* Set expressions on plate part (optional) */
  api.setExpressions({
    partId: plate[0],
    members: [{ name: 'Hole_Diameter', value: shaftDiameter }],
  })

  /* Add nut to nut-bolt assembly template */
  const [plateRef] = await api.addInstances({
    productId: plate[0],
    ownerId: 'RootAssembly',
    transformation: [pt0, xDir, yDir],
  })

  /* Get needed workcoordsystems of plate */
  const wcsIdPlateBase = await api.getWorkGeometry(plateRef, CCClasses.CCWorkCoordSystem, 'WCS_Origin')
  
  /* Set plate to origin of as1-assembly */
  api.createFastenedOriginConstraint(
    as1Asm,
    {
      matePath: [plateRef],
      wcsId: wcsIdPlateBase[0],
      flip: FlipType.FLIP_Z,
      reoriented: ReorientedType.REORIENTED_0,
    },
    0,
    0,
    0,
    'FOC2',
  )

  await api.transformInstances({
    id: 'NutBoltNode1',
    transformation: [{x: 40, y: 60, z: 0}, xDir, yDir],
  }, {
    id: 'NutBoltNode2',
    transformation: [{x: 25, y: 75, z: 20}, xDir, yDir],
  }, {
    id: 'NutBoltNode3',
    transformation: [{x: 40, y: 90, z: 0}, xDir, yDir],
  }, {
    id: 'NutBoltNode4',
    transformation: [{x: 140, y: 60, z: 0}, xDir, yDir],
  }, {
    id: 'NutBoltNode5',
    transformation: [{x: 155, y: 75, z: 20}, xDir, yDir],
  }, {
    id: 'NutBoltNode6',
    transformation: [{x: 140, y: 90, z: 0}, xDir, yDir],
  })

  return as1Asm
}

export const getScene = async (productId: number, api: ApiHistory) => {
  if (!api) return
  const { scene } = await api.createScene(productId, { meshPerGeometry: true })
  scene && colorize(scene)
  return scene
}

const colorize = (scene: THREE.Scene) => {
  // Color the first found object with name = 'Bolt'
  const [boltObj] = findObjectsByName('Bolt', scene)
  setObjectColor(boltObj, new Color('rgb(203, 67, 22)'))
  // Color all objects with name = 'Nut'
  const nutObjs = findObjectsByName('Nut', scene)
  nutObjs.forEach(nutObj => {
    setObjectColor(nutObj, new Color('rgb(23, 67, 180)'))
  })
  // Color a subassembly object with all its children
  const nutBoltObjs = findObjectsByName('NutBolt_Asm', scene)
  setObjectColor(nutBoltObjs[1], new Color('rgb(27, 196, 44)'))
  // ...
  const [lBracketObj] = findObjectsByName('LBracket', scene)
  setObjectColor(lBracketObj, new Color('rgb(220, 150, 20)'))
  // Set color and transparency on the first found object with name = 'Plate'
  const [plateObj] = findObjectsByName('Plate', scene)
  setObjectColor(plateObj, new Color('rgb(120, 80, 79)'))
  // ...
  const [rodObj] = findObjectsByName('Rod', scene)
  setObjectColor(rodObj, new Color('rgb(178, 0, 13)'))
}

export const cad = new history()

export default { create, getScene, paramsMap, cad }
