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
}
