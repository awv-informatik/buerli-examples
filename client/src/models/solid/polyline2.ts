import { ObjectID } from '@buerli.io/core'
import * as THREE from 'three'
import { Create, GetScene, Param } from '../../store'
import { setObjectColor } from '../../utils'

type PathPoint = {
  xa?: number
  ya?: number
  xr?: number
  yr?: number
  c?: number
  r?: number
  l?: number // Line length
  ar?: number // Angle relative (degrees)
}
function generateStarPolygon(
  n: number,
  outerD: number,
  innerD: number,
  outerRad: number,
  innerRad: number,
): PathPoint[] {
  if (n < 2) throw new Error('A star must have at least 2 outer points')

  const PI = Math.PI
  const angleStep = (2 * PI) / (n * 2) // 2n total points: outer + inner
  const points: PathPoint[] = []

  for (let i = 0; i < n * 2; i++) {
    const angle = i * angleStep
    const radius = i % 2 === 0 ? outerD / 2 : innerD / 2
    const fillet = i % 2 === 0 ? outerRad : innerRad
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    points.push({ xa: x, ya: y, r: fillet })
  }

  return points
}
function generateRegularPolygon(n: number, d: number): PathPoint[] {
  if (n < 3) throw new Error('A polygon must have at least 3 sides')

  const PI = Math.PI
  const angleStep = (2 * Math.PI) / n
  const sideLength = d / Math.cos(PI / n)

  let pld: PathPoint[] = [{ xa: 0, ya: 0 }] // Start at origin
  pld = pld.concat([{ xr: sideLength }]) // First horizontal edge

  for (let i = 1; i < n; i++) {
    pld = pld.concat([{ l: sideLength, ar: angleStep }])
  }
  return pld
}

function generateProfilePath(Wf: number, Tf: number, H: number, Tw: number, R: number, C: number): PathPoint[] {
  const halfWf = Wf / 2
  const halfTw = Tw / 2
  const halfH = H / 2

  let pld: PathPoint[] = []

  pld = [
    { xa: -halfWf, ya: -halfH - Tf, c: 2 }, // Bottom-left with chamfer
    { xr: Wf, c: 2 }, // Bottom-right
    { yr: Tf, c: 2 }, // Chamfered corner
    { xr: -halfWf + halfTw, r: 5 }, // Move inward
    { yr: H, r: 5 }, // Move up (web height)
    { xr: halfWf - halfTw, c: 2 }, // Left top flange start
    { yr: Tf, c: 2 }, // Move up (top flange)
    { xr: -Wf, c: 2 }, // Move left
    { yr: -Tf, c: 2 }, // Move down
    { xr: halfWf - halfTw, r: 5 }, // Inner top to web
    { yr: -H, r: 5 }, // Move down (web height)
    { xr: -halfWf + halfTw, c: 2 }, // Final segment
  ]
  return pld
}
const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1
  const part = await api.part.create()
  const ei = await api.part.entityInjection({ id: part })
  const ccShape = await api.curve.shape({ id: ei })

  /// Generate the Ibeam profile
  const pld = generateProfilePath(700, 50, 900, 40, 15, 15)
  await api.curve.advancedPolyline({ id: ccShape, pld: pld, close: true })
  const extrusion = await api.solid.extrusion({ id: ei, curves: [ccShape], direction: [0, 0, 1150] })

  /// Generate the n-sided polygon
  const ccShape1 = await api.curve.shape({ id: ei })
  const polygon = generateRegularPolygon(7, 125)
  await api.curve.advancedPolyline({ id: ccShape1, pld: polygon, close: true })
  const extrusion1 = await api.solid.extrusion({ id: ei, curves: [ccShape1], direction: [0, 0, -100] })

  //  Generate the star polygon with fillets
  const ccShape2 = await api.curve.shape({ id: ei })
  const star = generateStarPolygon(5, 200, 100, 4, 5)
  await api.curve.advancedPolyline({ id: ccShape2, pld: star, close: true })
  const extrusion2 = await api.solid.extrusion({ id: ei, curves: [ccShape2], direction: [0, 0, -500] })
  await api.solid.translation({ id: ei, target: extrusion2, translation: [500, 200, 500] })

  return [extrusion, extrusion1, extrusion2]
}

const getScene: GetScene = async (model, ids) => {
  if (!model) return
  const { scene, nodes } = await model.createScene(ids)
  scene && colorize(ids, nodes)
  return scene
}

const colorize = (ids: ObjectID | ObjectID[], nodes: { [key: string]: THREE.Object3D }) => {
  const [id] = ids as ObjectID[]
  const customRed = new THREE.Color('rgb(203, 67, 188)')
  setObjectColor(nodes[`${id}`], customRed)
}

export default { create, getScene, paramsMap }
