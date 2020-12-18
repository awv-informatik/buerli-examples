import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer from '../../resources/Bolt.of1'
import arraybuffer2 from '../../resources/Nut.of1'
import arraybuffer3 from '../../resources/LBracket.of1'

export const create = async (api: ApiHistory, testParam: number) => {
  const pt0 = { x: 0, y: 0, z: 0 }
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }

  const lBracketAsm = await api.createRootAssembly('LBracket_Asm')
  const nutBoltAsm = await api.createAssemblyAsTemplate('NutBolt_Asm')

  /* Bolt */
  const fileBolt = new File(['Bolt.of1'], 'Bolt.of1', { type: 'application/x-binary' })
  const bolt = await api.loadProduct(fileBolt, arraybuffer)
  const boltRefId = await api.addNode(bolt, nutBoltAsm, [pt0, xDir, yDir])
  const wcsIdBoltNut = await api.getWorkCoordSystem(boltRefId, 'WCS_Nut')
  const wcsIdBoltHeadShaft = await api.getWorkCoordSystem(boltRefId, 'WCS_Head-Shaft')
  const wcsIdOrigin = await api.getWorkCoordSystem(boltRefId, 'WCS_Origin')

  /* Bolt at origin */
  await api.createFastenedOriginConstraint(
    nutBoltAsm,
    { refId: boltRefId, wcsId: wcsIdOrigin[0] },
    0,
    0,
    0,
    0,
    0,
    'FOC',
  )

  /* Nut */
  const fileNut = new File(['Nut.of1'], 'Nut.of1', { type: 'application/x-binary' })
  const nut = await api.loadProduct(fileNut, arraybuffer2)
  const nutRefId = await api.addNode(nut, nutBoltAsm, [pt0, xDir, yDir])
  const wcsIdNut = await api.getWorkCoordSystem(nutRefId, 'WCS_Hole_Top')

  /* Nut on Bolt */
  await api.createFastenedConstraint(
    nutBoltAsm,
    { refId: boltRefId, wcsId: wcsIdBoltNut[0] },
    { refId: nutRefId, wcsId: wcsIdNut[0] },
    0,
    0,
    0,
    0,
    0,
    'FC1',
  )

  /* LBracket */
  const fileLBracket = new File(['LBracket.of1'], 'LBracket.of1', { type: 'application/x-binary' })
  const lBracket = await api.loadProduct(fileLBracket, arraybuffer3)
  const lBracketRef1 = await api.addNode(lBracket, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])
  const wcsIdLBracketOrigin = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Origin')
  const wcsIdLBracket1 = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole1-Top')
  const wcsIdLBracket2Top = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole2-Top')
  const wcsIdLBracket3 = await api.getWorkCoordSystem(lBracketRef1, 'WCS_Hole3-Top')

  /* LBracket at origin */
  await api.createFastenedOriginConstraint(
    lBracketAsm,
    { refId: lBracketRef1, wcsId: wcsIdLBracketOrigin[0] },
    0,
    0,
    0,
    0,
    0,
    'FOC',
  )

  const nutBoltAsmRef1 = await api.addNode(nutBoltAsm, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])
  const nutBoltAsmRef2 = await api.addNode(nutBoltAsm, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])
  const nutBoltAsmRef3 = await api.addNode(nutBoltAsm, lBracketAsm, [{ x: 0, y: 0, z: 0 }, xDir, yDir])

  /* NutBoltAsm on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef1, wcsId: wcsIdLBracket1[0] },
    { refId: nutBoltAsmRef1, wcsId: wcsIdBoltHeadShaft[0] },
    0,
    0,
    0,
    0,
    0,
    'FC2',
  )

  /* NutBoltAsm on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef1, wcsId: wcsIdLBracket2Top[0] },
    { refId: nutBoltAsmRef2, wcsId: wcsIdBoltHeadShaft[0] },
    0,
    0,
    0,
    0,
    0,
    'FC3',
  )

  /* NutBoltAsm on LBracket */
  await api.createFastenedConstraint(
    lBracketAsm,
    { refId: lBracketRef1, wcsId: wcsIdLBracket3[0] },
    { refId: nutBoltAsmRef3, wcsId: wcsIdBoltHeadShaft[0] },
    0,
    0,
    0,
    0,
    0,
    'FC4',
  )

  const geoms = await api.createBufferGeometry(lBracketAsm)
  api.saveFile('C:/04_AWV/CADDaten/TestParts/AssemblyBuilding/headlessExports/ConstraintProblem_Example.of1')
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
