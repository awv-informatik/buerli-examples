import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const box = await api.import('C:/temp/box.stp')
  api.scale(box[0], 2)
  api.save('C:/temp/savedbox.of1')
  const geom = await api.createBufferGeometry(box[0])
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.8,
      color: new THREE.Color('rgb(237, 152, 47)'),
    }),
  )

  return [mesh]
}

export default create
