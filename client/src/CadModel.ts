import { api as ccApi, Connection, ObjectID } from '@buerli.io/classcad'
import { DrawingID, getDrawing } from '@buerli.io/core'
import { BufferGeometry, Material, Object3D, Scene } from 'three'
import { createRecursiveBufferGeometry, createRecursiveScene } from './utils'

type ClassCadApi = ReturnType<typeof ccApi>

export class CadModel {
  private _drawingId: DrawingID
  private _api: ClassCadApi

  constructor() {}

  public get drawingId(): DrawingID {
    return this._drawingId
  }

  public get api(): ClassCadApi {
    return this._api
  }

  async init() {
    this._drawingId = await Connection.create()
    this._api = ccApi(this._drawingId)
  }

  /**
   * Creates the buffer geometry of any product (part or assembly).
   * @param productId id of the product to create buffer geometry from
   * @example
   * // Creates a cone with bottom diameter = 20, top diameter = 0 and height = 30
   * const part = api.createPart('Part')
   * api.cone(part, [], 20, 0, 30)
   * const geoms = await api.createBufferGeometry(part)
   * return geoms.map(geom => new THREE.Mesh(geom, new THREE.MeshStandardMaterial()))
   * @return array of buffer geometry
   */
  async createBufferGeometry(objectId?: ObjectID | ObjectID[]): Promise<BufferGeometry[] | undefined> {
    if (!objectId) return undefined
    const cDrawing = getDrawing(this.drawingId)
    const structureTree = cDrawing.structure.tree
    const ids = Array.isArray(objectId) ? objectId : [objectId]
    const bufferGeomArray: BufferGeometry[] = []
    for (const id of ids) {
      const obj = structureTree[id]
      if (obj) {
        await createRecursiveBufferGeometry(obj, this.drawingId, bufferGeomArray)
      } else {
        throw new Error('Object does not exist!')
      }
    }
    if (bufferGeomArray.length > 0) {
      return bufferGeomArray
    }
    return undefined
  }

  /**
   * Creates the threeJS scene of any product (part or assembly).
   * @param productId id of the product to create scene from
   * @param options optional object to define different settings.
   * @param meshPerGeometry boolean flag to define if a part/solid will have a mesh for each
   * geometry element or if the elements will be merged to one mesh
   * @return object containing all the created THREE objects like scene, nodes and materials
   * @example // tbd
   */
  async createScene(
    objectId?: ObjectID | ObjectID[],
    options?: { meshPerGeometry?: boolean; structureOnly?: boolean },
  ): Promise<{ scene: Scene; nodes: { [key: string]: Object3D }; materials: { [key: string]: Material } }> {
    const cDrawing = getDrawing(this.drawingId)
    const structureTree = cDrawing.structure.tree
    const ids = objectId ? (Array.isArray(objectId) ? objectId : [objectId]) : [cDrawing.structure.root]
    const scene: Scene = new Scene()
    const result: { nodes: { [key: string]: Object3D }; materials: { [key: string]: Material } } = {
      nodes: {},
      materials: {},
    }
    for (const id of ids) {
      const obj = structureTree[id]
      if (obj) {
        await createRecursiveScene(obj, this.drawingId, scene, result, options)
      } else {
        throw new Error('Object does not exist!')
      }
    }
    return { scene, ...result }
  }

  async createThreeShape(owner: ObjectID, shape: THREE.Shape) {
    const jobs = []
    for (const curve of shape.curves) {
      switch (curve.type) {
        case 'CubicBezierCurve':
          const c1 = curve as THREE.CubicBezierCurve
          const p11 = [c1.v0.x, c1.v0.y, 0]
          const p12 = [c1.v1.x, c1.v1.y, 0]
          const p13 = [c1.v2.x, c1.v2.y, 0]
          const p14 = [c1.v3.x, c1.v3.y, 0]
          jobs.push({ api: 'v1/curve/bezierCurve', param: { id: owner, points: [p11, p12, p13, p14] } })
          break
        case 'QuadraticBezierCurve':
          const c2 = curve as THREE.QuadraticBezierCurve
          const p21 = [c2.v0.x, c2.v0.y, 0]
          const p22 = [c2.v1.x, c2.v1.y, 0]
          const p23 = [c2.v2.x, c2.v2.y, 0]
          jobs.push({ api: 'v1/curve/bezierCurve', param: { id: owner, points: [p21, p22, p23] } })
          break
        case 'LineCurve':
          const c3 = curve as THREE.LineCurve
          const p31 = [c3.v1.x, c3.v1.y, 0]
          const p32 = [c3.v2.x, c3.v2.y, 0]
          jobs.push({ api: 'v1/curve/line', param: { id: owner, startPos: p31, endPos: p32 } })
          break
        case 'SplineCurve':
          const c4 = curve as THREE.SplineCurve
          const p41 = c4.points.map((p: THREE.Vector2) => [p.x, p.y, 0])
          jobs.push({ api: 'v1/curve/interpolationCurve', param: { id: owner, points: p41 } })
          break
        case 'EllipseCurve':
        case 'ArcCurve':
          const c5 = curve as THREE.ArcCurve
          jobs.push({
            api: 'v1/curve/ellipticArc',
            param: {
              id: owner,
              centerPos: [c5.aX, c5.aY, 0],
              startAngle: c5.aStartAngle,
              endAngle: c5.aEndAngle,
              radius1: c5.xRadius,
              radius2: c5.yRadius,
            },
          })
          break
        default:
          break
      }
    }
    await this.api.common.batch({ jobs })
  }
}
