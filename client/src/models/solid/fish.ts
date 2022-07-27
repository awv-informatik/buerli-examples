import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import { Api } from '../../history/store'

export const create = async (api: ApiNoHistory) => {
  const x = 25
  const y = 25
  const shape = new THREE.Shape()
  shape.moveTo(x, y)
  shape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10)
  shape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40)
  shape.quadraticCurveTo(x + 115, y, x + 115, y + 40)
  shape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10)
  shape.quadraticCurveTo(x + 50, y + 80, x, y)
  const basicBody = api.extrude([0, 0, 5], shape)
  return basicBody
}

const getBufferGeom = async (solidId: number, api: ApiNoHistory) => {
  if (!api) return
  const geom = await api.createBufferGeometry(solidId)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 120, 255)') }),
  )
  return [mesh]
}

export const getScene = async (solidId: number, api: ApiNoHistory) => {
  if (!api) return
  const scene = await api.createScene(solidId)
  return scene
}

export const apiType = Api.NOHISTORY

export default { create, getScene, apiType }
