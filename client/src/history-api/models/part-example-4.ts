import { ApiHistory } from '@buerli.io/headless'
import * as THREE from 'three'
import arraybuffer from '../../resources/Shadowbox.of1'

export const create = async (api: ApiHistory, ...params: number[]) => {
  const file = new File(['Shadowbox.of1'], 'Shadowbox.of1', {
    type: 'application/x-binary',
  })
  const part = api.loadProduct(file, arraybuffer)
  const minGap = 5
  const holeDiameter = 50
  let columns = 10
  let rows = 4
  const foamDepth = 20
  const foamHeight = 200
  const foamWidth = 400

  // Calculate max. columns and rows
  columns =
    foamWidth - columns * holeDiameter >= (columns + 1) * minGap
      ? columns
      : Math.floor((foamWidth - (columns + 1) * minGap) / holeDiameter)
  console.info('Columns: ' + columns)

  rows =
    foamHeight - rows * holeDiameter >= (rows + 1) * minGap
      ? rows
      : Math.floor((foamHeight - (rows + 1) * minGap) / holeDiameter)
  console.info('Rows: ' + rows)

  api.setExpressions(
    part,
    { name: 'Columns', value: columns },
    { name: 'Rows', value: rows },
    { name: 'HoleDiameter', value: holeDiameter },
    { name: 'FoamDepth', value: foamDepth },
    { name: 'FoamHeight', value: foamHeight },
    { name: 'FoamWidth', value: foamWidth },
  )

  const geoms = await api.createBufferGeometry(part)
  return geoms.map(
    geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(255, 0, 0)') })),
  )
}

export default create
