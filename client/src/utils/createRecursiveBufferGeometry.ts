import { api as ccApi, ccUtils } from '@buerli.io/classcad'
import { CCClasses, DrawingID, getDrawing, ScgObject, ScgTree } from '@buerli.io/core'
import { BufferGeometry } from 'three'
import { mergeBufferGeometries } from 'three-stdlib'

/**
 * Helps to create the buffer geometry of the given object recursively.
 * @param object object to create the buffergeometry from
 * @param bufferGeomArray array to fill up with buffert geometries
 */
export const createRecursiveBufferGeometry = async (
  object: ScgObject,
  drawingId: DrawingID,
  bufferGeomArray: BufferGeometry[],
) => {
  let cDrawing = getDrawing(drawingId)
  const tree: ScgTree = cDrawing.structure.tree
  if (object.link || object.solids) {
    // Part
    const baseModeler = ccApi(drawingId).v0.baseModeler
    const solids: number[] | undefined = object.link ? tree[object.link].solids : object.solids
    if (solids != undefined) {
      let geometries: BufferGeometry[] = []
      for (const solid of solids) {
        let cachedSolid = cDrawing.geometry.cache[solid]
        if (cachedSolid) {
          // if solid already cached, take it from cache
          geometries = [...geometries, ...cachedSolid.meshes.map(m => m.geometry)]
        } else {
          // else get visualisation from classcad
          await baseModeler.requestVisualisationOfEntities([solid])
          cDrawing = getDrawing(drawingId) // get current drawing state after request
          cachedSolid = cDrawing.geometry.cache[solid]
          if (cachedSolid) {
            geometries = [...geometries, ...cachedSolid.meshes.map(m => m.geometry)]
          } else {
            console.warn(`There is no cached entry for ${solid}!`, cDrawing.geometry.cache)
          }
        }
      }
      if (geometries.length > 0) {
        const transformation = cDrawing.api.structure.calculateGlobalTransformation(object.id)
        const bufferGeom = mergeBufferGeometries(geometries) as THREE.BufferGeometry
        bufferGeom.applyMatrix4(transformation)
        bufferGeomArray.push(bufferGeom)
      }
    }
  } else if (object.children) {
    // Assembly
    for (const child of object.children) {
      if (ccUtils.base.isA(tree[child].class, CCClasses.IProductReference)) {
        await createRecursiveBufferGeometry(tree[child], drawingId, bufferGeomArray)
      }
    }
  }
}
