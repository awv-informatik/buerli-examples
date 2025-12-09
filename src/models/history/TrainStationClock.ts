import { ObjectID } from '@buerli.io/core'
import arrayBuffer from '../../resources/history/TrainStationClock.ofb?buffer'
import { Create, Param, Update } from '../../store'

type RevoluteConstraint = {
  id: number
  name: string
  mate1: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  mate2: {
    path: number[]
    csys: number
    flip: 'X' | '-X' | 'Y' | '-Y' | 'Z' | '-Z'
    reorient: '0' | '90' | '180' | '270'
  }
  zOffset: number
  zRotationLimits: {
    min: number
    max: number
  }
}

let root: ObjectID
let hourPointerInst: ObjectID
let revoluteHour: RevoluteConstraint

export const paramsMap: Param[] = [].sort((a, b) => a.index - b.index)

const data = arrayBuffer

export const create: Create = async (model, params) => {
  hourPointerInst = undefined
  revoluteHour = undefined
  root = undefined

  const { common: commonApi, assembly: assemblyApi } = model.api.v1

  const res = await commonApi.load({ data: data, format: 'OFB', ident: 'root' })
  root = res.id
  hourPointerInst = (await assemblyApi.getInstance({ ownerId: root, name: 'hours' })) as number
  revoluteHour = (await assemblyApi.getRevolute({ id: root, name: 'Revolute1' })) as RevoluteConstraint

  // reset time to 0:00:00 Uhr
  await assemblyApi.update3DConstraintValue({ id: revoluteHour.id, name: 'Z_ROTATION', value: 0 })

  const currentTime = new Date()
  let h = currentTime.getHours()
  const m = currentTime.getMinutes()
  const s = currentTime.getSeconds()

  // current time in hours
  h = (h % 12) + m / 60 + s / 3600
  const angleH_deg = (360 / 12) * h
  const angleH_rad = (angleH_deg / 180) * Math.PI

  // calculate rotation
  const rotation = {
    xDir: [Math.cos(angleH_rad), -Math.sin(angleH_rad), 0],
    yDir: [Math.sin(angleH_rad), Math.cos(angleH_rad), 0],
    zDir: [0, 0, 1],
  }

  // rotate to current time
  await assemblyApi.startMovingUnderConstraints({
    id: root,
    instanceIds: [hourPointerInst],
    pivotInfo: [0, 0, 0],
    mucType: 'ROTATION',
  })
  await assemblyApi.moveUnderConstraints({ id: root, rotation })
  await assemblyApi.finishMovingUnderConstraints({ id: root })

  return root
}

export const update: Update = async (model, productId, params) => {
  const { assembly: assemblyApi } = model.api.v1

  if (Array.isArray(productId)) {
    throw new Error('Calling update does not support multiple product ids. Use a single product id only.')
  }

  // calculate angle per second of hour pointer, which rotates 30° in 1 hour
  const h = 1 / 3600
  const angleH_deg = (360 / 12) * h
  const angleH_rad = (angleH_deg / 180) * Math.PI

  const rotation = {
    xDir: [Math.cos(angleH_rad), -Math.sin(angleH_rad), 0],
    yDir: [Math.sin(angleH_rad), Math.cos(angleH_rad), 0],
    zDir: [0, 0, 1],
  }

  await assemblyApi.startMovingUnderConstraints({
    id: root,
    instanceIds: [hourPointerInst],
    pivotInfo: [0, 0, 0],
    mucType: 'ROTATION',
  })
  await assemblyApi.moveUnderConstraints({ id: root, rotation })
  await assemblyApi.finishMovingUnderConstraints({ id: root })

  return productId
}

export default { create, update, paramsMap }
