/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiHistory, history, RevoluteConstraintType, SliderConstraintType } from '@buerli.io/headless'
import { api as buerliApi, getDrawing, GraphicType, PointMemValue } from '@buerli.io/core'
import { Param, Create, storeApi, ParamType, Update } from '../../store'
import robotArm from '../../resources/history/RobotCellAssembly.ofb'
import { BrepElemType, CCClasses, LimitedValue } from '@buerli.io/classcad'
import * as THREE from 'three'

const rP = 0 // robot position
const sP = 1 // sledge position
const pC = 2 // part configuration
const cH = 3 // conveyor height

export const paramsMap: Param[] = [
  { index: rP, name: 'Robot Position', type: ParamType.Enum, value: 0, values: [0, 1, 2] },
  { index: sP, name: 'Sledge Position', type: ParamType.Slider, value: 0, step: 5, values: [0, 2200] },
  { index: pC, name: 'Part Config', type: ParamType.Enum, value: 0, values: [0, 1, 2] },
  { index: cH, name: 'Conveyor Height', type: ParamType.Slider, value: 200, step: 5, values: [150, 300] },
  { index: 901, name: 'Get Positions', type: ParamType.Button, value: logPositions },
  { index: 903, name: 'Select', type: ParamType.Button, value: selectGeometry },


].sort((a, b) => a.index - b.index)

let sliderConstr: SliderConstraintType
let revoluteConstrs: RevoluteConstraintType[] = []
let axis6: number[]
let wcsAxis6: number[]
let shadowBox: number[]
let wcsShadowBox: number[]
let rootAsm: number

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  if (!params) {
    const activeExample = storeApi.getState().activeExample
    params = storeApi.getState().examples.objs[activeExample].params
  }
  const root = await api.load(robotArm, 'ofb')
  rootAsm = root ? root[0] : null
  
  if (rootAsm !== null) {
    const [robotAsm] = await api.getAssemblyNode(rootAsm, 'Robot_Asm')
    axis6 = await api.getAssemblyNode(robotAsm, 'NAUO3')
    wcsAxis6 = await api.getWorkGeometry(axis6[0], CCClasses.CCWorkCoordSystem, 'WorkCoordSystem')
    shadowBox = await api.getAssemblyNode(rootAsm, 'Shadowbox')
    wcsShadowBox = await api.getWorkGeometry(shadowBox[0], CCClasses.CCWorkCoordSystem, 'WorkCoordSystem0')

    sliderConstr = await api.getSliderConstraint(rootAsm, 'Slider')
    revoluteConstrs = [
      await api.getRevoluteConstraint(robotAsm, 'Base-J1'),
      await api.getRevoluteConstraint(robotAsm, 'J1-J2'),
      await api.getRevoluteConstraint(robotAsm, 'J2-J3'),
      await api.getRevoluteConstraint(robotAsm, 'J3-J4'),
      await api.getRevoluteConstraint(robotAsm, 'J4-J5'),
      await api.getRevoluteConstraint(robotAsm, 'J5-J6'),
    ]

  }
  return rootAsm
}

export const update: Update = async (apiType, productId, params) => {
  const api = apiType as ApiHistory
  const updatedParamIndex = params.lastUpdatedParam

  const check = (param: Param) =>
    typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  // Update robot pos
  if (check(paramsMap[rP])) {
    await updateRobotPos(params.values[rP], api)
  }

  // Update sledge pos
  if (check(paramsMap[sP])) {
    await updateSledgePos(params.values[sP], api)
  }

  // Update part config
  if (check(paramsMap[pC])) {
    await updatePartConfig(params.values[pC], api)
  }

  // Update conveyor height
  if (check(paramsMap[cH])) {
    await updateConveyorHeight(params.values[cH], api)
  }

  return productId
}

export const cad = new history()

export default { create, update, paramsMap, cad }

async function updateRobotPos(posIndex: number, api: ApiHistory) {
  const constrValues: { constrId: number; paramName: LimitedValue; value: number }[] = []
  let angles = []
  switch (posIndex) {
    case 0:
      angles = [0,0,0,0,0,0]
      break
    case 1:
      angles = [0,20,10,0,60,0]
      break;
    case 2:
      angles = [100,80,-55,50,50,0]
      break;
    default:
      angles = [0,0,0,0,0,0];
      break;
  }
  for (let index = 0; index < angles.length; index++) {
    const angleInRadian = (angles[index] / 180) * Math.PI
    const constrValue = {
      constrId: await revoluteConstrs[index].constrId,
      paramName: 'zRotationValue' as LimitedValue,
      value: angleInRadian,
    }
    constrValues.push(constrValue)
  }
  await api.update3dConstraintValues(...constrValues)
}

async function updateSledgePos(pos: number, api: ApiHistory) {
  await api.update3dConstraintValues({
    constrId: sliderConstr.constrId,
    paramName: 'zOffsetValue',
    value: pos,
  })
}

async function updatePartConfig(configIndex, api: ApiHistory) {
  const [part] = await api.getPartFromContainer('Shadowbox')
  let holeDiameter = 20
  let columns = 6
  let rows = 4
  switch (configIndex) {
    case 0:
      holeDiameter = 20
      columns = 6
      rows = 4
      break
    case 1:
      holeDiameter = 10
      columns = 8
      rows = 4
      break;
    case 2:
      holeDiameter = 30
      columns = 3
      rows = 4
      break;
    default:
      holeDiameter = 20
      columns = 6
      rows = 4
      break;
  }
  await api.setExpressions({ partId: part, members: [{ name: 'Columns', value: columns }, { name: 'Rows', value: rows }, { name: 'HoleDiameter', value: holeDiameter}] })
}

async function updateConveyorHeight(height: number, api: ApiHistory) {
  const [conveyor] = await api.getPartFromContainer('Conveyor')
  await api.setExpressions({ partId: conveyor, members: [{ name: 'ConveyorHeight', value: height }] })
}

async function selectGeometry(api: ApiHistory) {

  // Info: 'selectGeometry' method not yet available in buerli package

  // const info = await api.selectGeometry([GraphicType.POINT, GraphicType.PLANE])
  // const activeDrawing = buerliApi.getState().drawing.active
  // const drawing = getDrawing(activeDrawing)
  // if (info.userData.type === 'point') {
  //   const matrix = drawing.api.structure.calculateGlobalTransformation(info.prodRefId)
  //   const localPos = new THREE.Vector3(info.userData.position.x, info.userData.position.y, info.userData.position.z)
  //   const globalPos = localPos.applyMatrix4(matrix)
  //   console.info('global position of selected vertex: ', globalPos)
  // }
}

async function logPositions() {

  let globalMatrix = calculateWCSMatrix(axis6[0], wcsAxis6[0])
  console.info('global matrix of wcs (robot axis 6): ', globalMatrix)

  globalMatrix = calculateWCSMatrix(shadowBox[0], wcsShadowBox[0])
  console.info('global matrix of wcs (shadowbox): ', globalMatrix)
  

  let globalPos = calculateWCSPos(axis6[0], wcsAxis6[0])
  console.info('global position of wcs (robot axis 6): ', globalPos)

  globalPos = calculateWCSPos(shadowBox[0], wcsShadowBox[0])
  console.info('global position of wcs (shadowbox): ', globalPos)

}

function calculateWCSMatrix(node: number, wcsOfNode: number) {
  const activeDrawing = buerliApi.getState().drawing.active
  const drawing = getDrawing(activeDrawing)
  const matrix = drawing.api.structure.calculateGlobalTransformation(node)
  const tree = drawing.structure.tree
  const wcs = tree[wcsOfNode]

  // Get all information from wcs
  const tolerance = 1e-6
  let value = tree[wcs.children[0]].members?.Position.value as PointMemValue
  const originPos = new THREE.Vector3(value.x, value.y, value.z)
  value = tree[wcs.children[1]].members?.Direction.value as PointMemValue
  const xDir = new THREE.Vector3(value.x, value.y, value.z)
  value = tree[wcs.children[2]].members?.Direction.value as PointMemValue
  const yDir = new THREE.Vector3(value.x, value.y, value.z)
  value = tree[wcs.children[3]].members?.Direction.value as PointMemValue
  const zDir = new THREE.Vector3(value.x, value.y, value.z)
  value = wcs.members?.Offset.value as PointMemValue
  const offset = new THREE.Vector3(value.x, value.y, value.z)
  value = wcs.members?.Rotation.value as PointMemValue
  const rotation = new THREE.Vector3(value.x, value.y, value.z)
  const inverted = wcs.members?.Inverted.value === 0 ? false : true

  const xDir_ = xDir.clone().normalize()
  let yDir_ = yDir.clone().normalize()
  if (Math.abs(yDir_.dot(xDir_)) > 1 - tolerance) {
    yDir_ = Math.abs(xDir_.y) !== 1 ? new THREE.Vector3(0.0, 1.0, 0.0) : new THREE.Vector3(1.0, 0.0, 0.0)
  }
  const xAxis = xDir_
  const zAxis = xDir_.clone().cross(yDir_).normalize()
  const yAxis = zAxis.clone().cross(xAxis).normalize()

  if (inverted) {
    xAxis.negate()
    zAxis.negate()
  }

  const mLocal = new THREE.Matrix4()
    .makeRotationFromEuler(new THREE.Euler(rotation.x, rotation.y, rotation.z))
    .setPosition(offset.x, offset.y, offset.z)
  const mGlobal = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis).setPosition(originPos)
  const mGlobal2 = mGlobal.clone().multiply(mLocal)
  const globalMatrix = matrix.clone().multiply(mGlobal2)
  return globalMatrix
}

function calculateWCSPos(node: number, wcsOfNode: number) {
  const activeDrawing = buerliApi.getState().drawing.active
  const drawing = getDrawing(activeDrawing)
  const matrix = drawing.api.structure.calculateGlobalTransformation(node)
  const localPos = drawing.structure.tree[wcsOfNode].members?.Position.value as PointMemValue
  const globalPos = new THREE.Vector3(localPos.x, localPos.y, localPos.z).applyMatrix4(matrix)
  return globalPos
}


