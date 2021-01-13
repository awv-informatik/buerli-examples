import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer from '../../shared/resources/Flange.of1'

export const create = async (api: ApiHistory, testParam: number) => {
  const file = new File(['Flange.of1'], 'Flange.of1', { type: 'application/x-binary' })
  const part = api.loadProduct(file, arraybuffer)
  const flanschdicke = 25
  const innenradius = 100
  const anzahlBohrungen = Math.ceil(innenradius / 10) >= 3 ? Math.ceil(innenradius / 10) : 3

  api.setExpressions(
    part,
    { name: 'AnzahlBohrungen', value: anzahlBohrungen },
    { name: 'Flanschdicke', value: flanschdicke },
    { name: 'Innenradius', value: innenradius },
  )

  const geoms = await api.createBufferGeometry(part)
  return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
}

export default create
