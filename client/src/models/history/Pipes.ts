import { FlipType, ReorientedType, CCClasses } from '@buerli.io/classcad'
import { ApiHistory, history, Transform } from '@buerli.io/headless'
import { Create, Param, ParamType } from '../../store'
import straightPipe from '../../resources/history/Pipes/StraightPipe.ofb?buffer'
import curvedPipe from '../../resources/history/Pipes/TorusPipe.ofb?buffer'

export const paramsMap: Param[] = [
  { index: 901, name: 'Save', type: ParamType.Button, value: saveOfb },
].sort((a, b) => a.index - b.index)

export const create: Create = async (apiType, params) => {
  const api = apiType as ApiHistory

  /* consts */
  const xDir = { x: 1, y: 0, z: 0 }
  const yDir = { x: 0, y: 1, z: 0 }
  const origin = { x: 0, y: 0, z: 0 }
  const originTransform: Transform = [origin, xDir, yDir]
  const pipeInstances: number[] = []

  type CurvedPipe = { angle: number; radius: number; rotation: number }
  type StraightPipe = { length: number }

  function isStraight(pipe: StraightPipe): pipe is StraightPipe {
    return pipe.length !== undefined
  }

  /**
   * configruation table
   * Add, remove or edit pipes here to create new pipe assembly
   */
  const pipesTable: (StraightPipe | CurvedPipe)[] = [
    { length: 189 },
    { angle: Math.PI / 2, radius: 300, rotation: 0 },
    { length: 350 },
    { angle: Math.PI / 3, radius: 160, rotation: Math.PI / 2 },
    { length: 100 },
    { angle: Math.PI / 3, radius: 220, rotation: Math.PI/3*4 },
    { length: 260 },
    { angle: 4* Math.PI / 3, radius: 160, rotation: Math.PI / 2 },
  ]

  /* root assembly */
  const rootAsm = await api.createRootAssembly('PipeAsm')

  /**
   * Add all instances, for each pipe in the table do:
   * 1. load the part (straight or curved pipe)
   * 2. configure the part with expressions
   * 3. add the part as an instance to the root assembly
   */
  for (let i = 0; i < pipesTable.length; i++) {
    const pipe = pipesTable[i]
    if (isStraight(pipe as StraightPipe)) {
      const [pipePart] = await api.loadProduct(straightPipe, 'ofb')
      await api.setExpressions({
        partId: pipePart,
        members: [{ name: 'length', value: (pipe as StraightPipe).length }],
      })
      const [pipeInstance] = await api.addInstances({
        productId: pipePart,
        ownerId: rootAsm,
        transformation: originTransform,
        name: 'StraightPipe' + i,
      })
      pipeInstances.push(pipeInstance)
    } else {
      const [pipePart] = await api.loadProduct(curvedPipe, 'ofb')
      await api.setExpressions({
        partId: pipePart,
        members: [
          { name: 'angle', value: (pipe as CurvedPipe).angle },
          { name: 'radius', value: (pipe as CurvedPipe).radius },
        ],
      })
      const [pipeInstance] = await api.addInstances({
        productId: pipePart,
        ownerId: rootAsm,
        transformation: originTransform,
        name: 'CurvedPipe' + i,
      })
      pipeInstances.push(pipeInstance)
    }
  }

  /**
   * Connect all instances with constraints
   * 1. get the work coordinate system of both instances (wcs0 and wcs1)
   * 2. create a constraint depending on the type of pipe (fastened or revolute constraint)
   * 3. in case of revolute constraint, set the rotation value around z
   */
  for (let i = 0; i < pipeInstances.length; i++) {
    const pipe = pipesTable[i]
    const pipeInstance = pipeInstances[i]
    if (i === 0) {
      const [wcs0] = await api.getWorkGeometry(pipeInstance, CCClasses.CCWorkCSys, 'WCS0')
      await api.createFastenedOriginConstraint(
        rootAsm,
        { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
        0,
        0,
        0,
        'FOC',
      )
    } else {
      const pipeInstBefore = pipeInstances[i - 1]
      const [wcs0] = await api.getWorkGeometry(pipeInstance, CCClasses.CCWorkCSys, 'WCS0')
      const [wcs1] = await api.getWorkGeometry(pipeInstBefore, CCClasses.CCWorkCSys, 'WCS1')
      if (isStraight(pipe as StraightPipe)) {
        await api.createFastenedConstraint(
          rootAsm,
          { matePath: [pipeInstBefore], wcsId: wcs1, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
          { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
          0,
          0,
          0,
          'FC' + i,
        )
      } else {
        const constrId = await api.createRevoluteConstraint(
          rootAsm,
          { matePath: [pipeInstBefore], wcsId: wcs1, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
          { matePath: [pipeInstance], wcsId: wcs0, flip: FlipType.FLIP_Z, reoriented: ReorientedType.REORIENTED_0 },
          0,
          { min: { value: 0, isExpr: false }, max: { value: 2 * Math.PI, isExpr: false } },
          'RC' + i,
        )
        await api.update3dConstraintValues({
          constrId,
          paramName: 'zRotationValue',
          value: (pipe as CurvedPipe).rotation,
        })
      }
    }
  }
  return rootAsm
}

/** Helper function to save pipe as ofb file */
async function saveOfb(api: ApiHistory) {
  const data = await api.save('ofb')
  if (data) {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
    link.download = `Pipe.ofb`
    link.click()
  }
}

export const cad = new history()

export default { create, paramsMap, cad }
