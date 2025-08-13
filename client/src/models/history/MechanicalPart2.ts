import { BuerliCadFacade } from '@buerli.io/classcad'
import { Create, Param, ParamType } from '../../store'

const paramsMap: Param[] = [
  { index: 901, name: 'saveAsOfb', type: ParamType.Button, value: saveOfb }
].sort((a, b) => a.index - b.index)

const create: Create = async (model, params) => {
  const api = model.api.v1

  const part = await api.part.create()

  // expressions
  await api.part.expression({
    id: part,
    toCreate: [
      { name: 'length', value: 41 },
      { name: 'height', value: '0.65*length' },
      { name: 'thickness', value: '0.2*length' },
      { name: 'length2', value: '0.6*length' },
      { name: 'height2', value: '0.26*length' },
    ],
  })

  // create model
  const box1 = await api.part.box({
    id: part,
    length: '@expr.length',
    height: '@expr.height',
    width: '@expr.thickness',
  })
  const wcs2 = await api.part.workCSys({ id: part, offset: '[@expr.thickness,0,@expr.thickness]' })
  const box2 = await api.part.box({
    id: part,
    references: [wcs2],
    length: '@expr.length2',
    height: '@expr.height2',
    width: '@expr.thickness',
  })
  const subtraction = await api.part.boolean({ id: part, type: 'SUBTRACTION', target: { id: box1 }, tools: [box2] })
  const expr = await api.part.getExpression({ id: part, name: 'length' })
  const faces = await api.part.getGeometryIds({ id: part, planes: [{ positions: [[expr.value, 1, 1]] }] })
  const workPlane = await api.part.workPlane({ id: part, type: 'PLANE', references: [faces.planes[0]] })
  const mirror = await api.part.mirror({ id: part, references: [workPlane], targets: [subtraction] })
  await api.part.setAppearance({ target: mirror, color: [125,36,145] })
  const workAxis = await api.part.workAxis({
    id: part,
    position: '[0,@expr.thickness/2,@expr.height/2]',
  })
  const rotation = await api.part.rotation({
    id: part,
    targets: [{ id: mirror, indices: [1] }],
    references: [workAxis],
    angle: '90g',
  })
  const translation = await api.part.translation({
    id: part,
    targets: [rotation],
    references: [workAxis],
    distance: '-2*@expr.thickness',
  })

  await api.part.setAppearance({ target: translation, color: [25,96,145] })

  return part
}

async function saveOfb(model: BuerliCadFacade) {
  const ofbData = await model.api.v1.common.save({ format: 'OFB' })
  if (ofbData) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([ofbData.content], { type: 'application/octet-stream' }))
    link.download = `MechanicalPart2.ofb`
    link.click()
  }
}

export default { create, paramsMap }
