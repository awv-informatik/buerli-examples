import * as THREE from 'three'
import { Create, GetBufferGeom, Param, ParamType, Update } from '../../store'

const paramsMap: Param[] = [{ index: 0, name: 'Happy?', type: ParamType.Checkbox, value: true }].sort(
  (a, b) => a.index - b.index,
)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const direction = [0, 0, 5]
  const part = await api.part.create()
  const ei = await api.part.entityInjection({ id: part })

  const smiley = new THREE.Shape()
  smiley.moveTo(80, 40)
  smiley.absarc(40, 40, 40, 0, Math.PI * 2, false)
  const ccSmiley = await api.curve.shape({ id: ei })
  await model.createThreeShape(ccSmiley, smiley)
  const smileyBody = await api.solid.extrusion({ id: ei, curves: [ccSmiley], direction })

  const smileyEye1 = new THREE.Shape()
  smileyEye1.moveTo(35, 20)
  smileyEye1.absellipse(25, 20, 10, 10, 0, Math.PI * 2, true, 0)
  const ccSmileyEye1 = await api.curve.shape({ id: ei })
  await model.createThreeShape(ccSmileyEye1, smileyEye1)
  const smileyEye1Body = await api.solid.extrusion({ id: ei, curves: [ccSmileyEye1], direction })

  const smileyEye2 = new THREE.Shape()
  smileyEye2.moveTo(65, 20)
  smileyEye2.absarc(55, 20, 10, 0, Math.PI * 2, true)
  const ccSmileyEye2 = await api.curve.shape({ id: ei })
  await model.createThreeShape(ccSmileyEye2, smileyEye2)
  const smileyEye2Body = await api.solid.extrusion({ id: ei, curves: [ccSmileyEye2], direction })

  const smileyMouth = new THREE.Shape()
  smileyMouth.moveTo(20, 40)
  smileyMouth.quadraticCurveTo(40, 60, 60, 40)
  smileyMouth.bezierCurveTo(70, 45, 70, 50, 60, 60)
  smileyMouth.quadraticCurveTo(40, 80, 20, 60)
  smileyMouth.quadraticCurveTo(5, 50, 20, 40)
  const ccSmileyMouth = await api.curve.shape({ id: ei })
  await model.createThreeShape(ccSmileyMouth, smileyMouth)
  const smileyMouthBody = await api.solid.extrusion({ id: ei, curves: [ccSmileyMouth], direction })

  if (!params.values[0]) {
    await api.solid.rotation({ id: ei, target: { id: smileyMouthBody }, rotation: [Math.PI, 0, 0] })
    await api.solid.translation({ id: ei, target: { id: smileyMouthBody }, translation: [0, 110, 5] })
  }
  await api.solid.subtraction({ id: ei, target: { id: smileyBody }, tools: [{ id: smileyEye1Body }] })
  await api.solid.subtraction({ id: ei, target: { id: smileyBody }, tools: [{ id: smileyEye2Body }] })
  await api.solid.subtraction({ id: ei, target: { id: smileyBody }, tools: [{ id: smileyMouthBody }] })

  await api.solid.rotation({ id: ei, target: { id: smileyBody }, rotation: [Math.PI, 0, 0] })
  return [smileyBody]
}

const update: Update = async (model, productId, params) => {
  const api = model.api.v1
  const updatedParamIndex = params.lastUpdatedParam
  const check = (param: Param) => typeof updatedParamIndex === 'undefined' || param.index === updatedParamIndex

  if (check(paramsMap[0])) {
    await api.common.clear()
    return create(model, params)
  }
}

const getBufferGeom: GetBufferGeom = async (model, ids) => {
  if (!model) return
  const meshes: THREE.Mesh[] = []
  ids = Array.isArray(ids) ? ids : [ids]
  for await (const solidId of ids) {
    const geom = await model.createBufferGeometry(solidId)
    const mesh = new THREE.Mesh(
      geom[0],
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 1,
        color: new THREE.Color('rgb(252, 252, 45)'),
      }),
    )
    meshes.push(mesh)
  }
  return meshes
}

export default { create, update, getBufferGeom, paramsMap }
