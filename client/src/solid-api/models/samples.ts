import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const box = api.import('C:/temp/box.stp')
  api.scale(box, 2)
  api.save('C:/temp/savedbox.of1')
  const geom = await api.createBufferGeometry(box)
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
