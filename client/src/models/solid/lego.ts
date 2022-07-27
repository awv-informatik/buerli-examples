import { ApiNoHistory } from '@buerli.io/headless'
import * as THREE from 'three'

export const create = async (api: ApiNoHistory) => {
  const rows = 2
  const columns = 4
  const unitLength = 8
  const width = rows * unitLength
  const length = columns * unitLength
  const thickness = 1.6
  const height = unitLength + thickness
  const dotHeight = 1.7
  const dotRadius = 2.4
  const dotGap = dotRadius + thickness
  const tubeHeight = height - thickness
  const tubeRadius = (2 * dotGap * Math.sqrt(2) - 2 * dotRadius) / 2
  // body
  const basic = api.box(width, height, length)
  const subBox = api.box(width - 2 * thickness, height - thickness, length - 2 * thickness)
  api.moveTo(subBox, [0, -thickness, 0])
  api.subtract(basic, false, subBox)
  // dots
  const dot = api.cylinder(dotHeight, 2 * dotRadius)
  api.rotateTo(dot, [Math.PI / 2, 0, 0])
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      api.moveTo(dot, [
        width / 2 - dotGap - j * (2 * dotGap),
        (height + dotHeight) / 2,
        length / 2 - dotGap - i * (2 * dotGap),
      ])
      api.union(basic, true, dot)
    }
  }
  api.clearSolid(dot)
  // tubes
  if (rows > 1 && columns > 1) {
    const tube = api.cylinder(tubeHeight, 2 * tubeRadius)
    const subCyl = api.cylinder(tubeHeight, 2 * (tubeRadius - thickness))
    api.subtract(tube, false, subCyl)
    api.rotateTo(tube, [Math.PI / 2, 0, 0])
    api.moveTo(tube, [0, -thickness / 2, 0])
    for (let i = 0; i < columns - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        api.moveTo(tube, [
          width / 2 - 2 * dotGap - j * (2 * dotGap),
          -thickness / 2,
          length / 2 - 2 * dotGap - i * (2 * dotGap),
        ])
        api.union(basic, true, tube)
      }
    }
    api.clearSolid(tube)
  }
  const geom = await api.createBufferGeometry(basic)
  const mesh = new THREE.Mesh(
    geom,
    new THREE.MeshStandardMaterial({ transparent: true, opacity: 1, color: new THREE.Color('rgb(255, 0, 0)') }),
  )
  return [mesh]
}

export default create
