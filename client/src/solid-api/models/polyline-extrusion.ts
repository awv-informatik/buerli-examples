import { ApiNoHistory, createPolyline, FilletPoint, Polyline } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const fp0: FilletPoint = { point: new THREE.Vector3(0, 25, 0), radius: 0 }
  const fp1: FilletPoint = { point: new THREE.Vector3(75, 25, 0), radius: 0 }
  const fp2: FilletPoint = { point: new THREE.Vector3(75, 0, 0), radius: 10 }
  const fp3: FilletPoint = { point: new THREE.Vector3(100, 0, 0), radius: 0 }
  const fp4: FilletPoint = { point: new THREE.Vector3(100, 100, 0), radius: 20 }
  const fp5: FilletPoint = { point: new THREE.Vector3(25, 75, 0), radius: 15 }
  const fp6: FilletPoint = { point: new THREE.Vector3(25, 100, 0), radius: 0 }
  const fp7: FilletPoint = { point: new THREE.Vector3(0, 100, 0), radius: 0 }
  const polyline: Polyline = createPolyline([fp0, fp1, fp2, fp3, fp4, fp5, fp6, fp7])
  const extrusion = api.extrude([0, 0, 25], polyline)
  const geom = await api.createBufferGeometry(extrusion)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.8,
      color: new THREE.Color('rgb(237, 47, 234)'),
    }),
  )
  return [mesh]
}

export default create
