import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const smileyShape = new THREE.Shape()
  smileyShape.moveTo(80, 40)
  smileyShape.absarc(40, 40, 40, 0, Math.PI * 2, false)
  const smileyShapeBody = api.extrude([0, 0, 5], smileyShape)
  const smileyEye1Path = new THREE.Shape()
  smileyEye1Path.moveTo(35, 20)
  smileyEye1Path.absellipse(25, 20, 10, 10, 0, Math.PI * 2, true, 0)
  const smileyEye1PathBody = api.extrude([0, 0, 5], smileyEye1Path)
  const smileyEye2Path = new THREE.Shape()
  smileyEye2Path.moveTo(65, 20)
  smileyEye2Path.absarc(55, 20, 10, 0, Math.PI * 2, true)
  const smileyEye2PathBody = api.extrude([0, 0, 5], smileyEye2Path)
  const smileyMouthPath = new THREE.Shape()
  smileyMouthPath.moveTo(20, 40)
  smileyMouthPath.quadraticCurveTo(40, 60, 60, 40)
  smileyMouthPath.bezierCurveTo(70, 45, 70, 50, 60, 60)
  smileyMouthPath.quadraticCurveTo(40, 80, 20, 60)
  smileyMouthPath.quadraticCurveTo(5, 50, 20, 40)
  const smileyMouthPathBody = api.extrude([0, 0, 5], smileyMouthPath)
  const basicBody = api.subtract(smileyShapeBody, false, smileyEye1PathBody, smileyEye2PathBody, smileyMouthPathBody)
  api.rotateTo(basicBody, [Math.PI, 0, 0])
  const geom = await api.createBufferGeometry(basicBody)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 255, 0)') }),
  )
  return [mesh]
}

export default create
