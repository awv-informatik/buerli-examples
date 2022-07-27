import { ApiNoHistory, createPolyline, FilletPoint, Polyline } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const fp0: FilletPoint = { point: new THREE.Vector3(0, 200, 140), radius: 0 }
  const fp1: FilletPoint = { point: new THREE.Vector3(0, 200, -73.676), radius: 0 }
  const fp2: FilletPoint = { point: new THREE.Vector3(0, 80, -30), radius: 0 }
  const fp3: FilletPoint = { point: new THREE.Vector3(0, 80, 0), radius: 0 }
  const fp4: FilletPoint = { point: new THREE.Vector3(0, 0, 0), radius: 0 }
  const fp5: FilletPoint = { point: new THREE.Vector3(0, 0, -55), radius: 0 }
  const fp6: FilletPoint = { point: new THREE.Vector3(0, 30, -55), radius: 0 }
  const fp7: FilletPoint = { point: new THREE.Vector3(0, 30, -50), radius: 0 }
  const fp8: FilletPoint = { point: new THREE.Vector3(0, 80, -50), radius: 0 }
  const fp9: FilletPoint = { point: new THREE.Vector3(0, 200, -93.676), radius: 0 }
  const fp10: FilletPoint = { point: new THREE.Vector3(0, 200, -140), radius: 0 }
  const fp11: FilletPoint = { point: new THREE.Vector3(0, 220, -140), radius: 0 }
  const fp12: FilletPoint = { point: new THREE.Vector3(0, 220, -135), radius: 0 }
  const fp13: FilletPoint = { point: new THREE.Vector3(0, 205, -135), radius: 0 }
  const fp14: FilletPoint = { point: new THREE.Vector3(0, 205, 135), radius: 0 }
  const fp15: FilletPoint = { point: new THREE.Vector3(0, 220, 135), radius: 0 }
  const fp16: FilletPoint = { point: new THREE.Vector3(0, 220, 140), radius: 0 }
  const polyline1: Polyline = createPolyline([
    fp0,
    fp1,
    fp2,
    fp3,
    fp4,
    fp5,
    fp6,
    fp7,
    fp8,
    fp9,
    fp10,
    fp11,
    fp12,
    fp13,
    fp14,
    fp15,
    fp16,
  ])
  const fp20: FilletPoint = { point: new THREE.Vector3(-85, -10, -137.5), radius: 0 }
  const fp21: FilletPoint = { point: new THREE.Vector3(-185, -36.795, -137.5), radius: 0 }
  const fp22: FilletPoint = { point: new THREE.Vector3(-185, 36.795, -137.5), radius: 0 }
  const fp23: FilletPoint = { point: new THREE.Vector3(-85, 10, -137.5), radius: 0 }
  const polyline2: Polyline = createPolyline([fp20, fp21, fp22, fp23])
  const basicBody = api.revolve([0, 0, 0], [0, 0, 100], 2 * Math.PI, polyline1)
  const subSolid = api.extrude([0, 0, 500], polyline2)
  const nof = 6
  const angle = (2 * Math.PI) / nof
  for (let i = 0; i < nof; i++) {
    api.rotateTo(subSolid, [0, 0, i * angle])
    api.subtract(basicBody, true, subSolid)
  }
  const basicBody2 = api.copy(basicBody)
  api.mirror(basicBody2, [0, 0, 400], [0, 0, 1])
  api.union(basicBody, false, basicBody2)
  const basicBody3 = api.copy(basicBody)
  api.mirror(basicBody3, [800, 0, 200], [1, 0, 0])
  api.union(basicBody, false, basicBody3)
  const geom = await api.createBufferGeometry(basicBody)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.8, color: new THREE.Color('rgb(255, 0, 255)') }),
  )
  return [mesh]
}

export default create
