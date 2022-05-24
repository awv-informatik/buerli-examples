import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import data from '../../shared/resources/ventil.stp'

export const create = async (api: ApiNoHistory) => {
  const importedIds = await api.import(data)
  const geom = await api.createBufferGeometry(importedIds[0])
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 120, 255)') }),
  )
  return [mesh]
}

export default create
