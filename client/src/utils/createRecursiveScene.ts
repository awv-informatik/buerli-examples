import { api as ccApi, ccUtils } from '@buerli.io/classcad'
import { CCClasses, DrawingID, getDrawing, MathUtils, ScgObject } from '@buerli.io/core'
import { Group, Material, Matrix4, Mesh, MeshStandardMaterial, Object3D } from 'three'
import { mergeBufferGeometries } from 'three-stdlib'
import { getDifferentColoredMeshesFromEntity } from './'

/**
 * We traverse recursively over structure tree, starting with object and create THREE objects
 * for the scene. Each part or assembly will be turned into groups and subgroups. Solids which are children of the
 * parts will be turned into groups as well. Children of solids will be merged to meshes. Faces of a solid with different color
 * or transparency will get its own mesh.
 * @param object root object where we start building the three scene
 * @param drawingId id of the drawing
 * @param root the root of the scene
 * @param result object containing all the current collected nodes, solids, meshes
 * @param options e.g. meshPerGeometry controls if each geometry element gets a own mesh or if they will be combined/merged
 */
export const createRecursiveScene = async (
  object: ScgObject,
  drawingId: DrawingID,
  root: Object3D,
  result: { nodes: { [key: string]: Object3D }; materials: { [key: string]: Material } },
  options?: { meshPerGeometry?: boolean; structureOnly?: boolean },
) => {
  let cDrawing = getDrawing(drawingId)
  const tree = cDrawing.structure.tree
  if (object.link || object.solids || object.geometryIdList) {
    // Part or Solid
    const baseModeler = ccApi(drawingId).v0.baseModeler
    const entities = object.link ? tree[object.link].solids : object.solids ? object.solids : object.geometryIdList
    if (entities != undefined) {
      const part = new Group()
      const matrix = object.coordinateSystem ? MathUtils.convertToMatrix4(object.coordinateSystem) : new Matrix4()
      matrix.decompose(part.position, part.quaternion, part.scale)
      part.updateMatrix()
      part.userData = { id: object.id } // instance id
      part.name = object.name // instance name
      for (const entity of entities) {
        let cachedEntity = cDrawing.geometry.cache[entity]
        if (!cachedEntity) {
          // else get visualisation from classcad
          await baseModeler.requestVisualisationOfEntities([entity])
          cDrawing = getDrawing(drawingId) // get current drawing state after request
          cachedEntity = cDrawing.geometry.cache[entity]
        }
        if (cachedEntity && cachedEntity.meshes.length > 0) {
          const solidObject = cDrawing.structure.tree[cachedEntity.container.ownerId]
          if (solidObject) {
            const _solid = new Group()
            _solid.name = solidObject.name + '_solid'
            _solid.userData = { id: solidObject.id } // add solid id to the userData
            result.nodes[_solid.name] = _solid
            result.nodes[`${solidObject.id}`] = _solid

            if (options?.meshPerGeometry) {
              // Create a mesh for each geometry element
              cachedEntity.meshes.forEach((m, i) => {
                const mesh = new Mesh()
                mesh.name = solidObject.name + '_' + i
                mesh.userData = { id: m.graphicId } // add graphic id to the userData

                if (!options?.structureOnly) {
                  mesh.geometry = m.geometry
                  mesh.material = new MeshStandardMaterial({
                    color: m.color ? m.color : cachedEntity.color,
                    transparent: m.color ? m.opacity < 1 : cachedEntity.opacity < 1,
                    opacity: m.color ? m.opacity : cachedEntity.opacity,
                  })
                  mesh.material.name = mesh.name + '_material'
                  result.materials[mesh.material.name] = mesh.material
                }

                result.nodes[mesh.name] = mesh
                _solid.add(mesh)
              })
              part.add(_solid)
            } else {
              // Merge all geometries into one mesh, sort them by color
              const colorMeshesMap = getDifferentColoredMeshesFromEntity(cachedEntity)
              const colorMeshes = Object.keys(colorMeshesMap)

              if (colorMeshes.length > 1) {
                // If the solid consists of multiple meshes we must keep the group
                colorMeshes.forEach((key, i) => {
                  const mesh = new Mesh()
                  mesh.name = solidObject.name + '_' + i
                  mesh.userData = { id: solidObject.id } // add solid id to the userData

                  if (!options?.structureOnly) {
                    mesh.geometry = mergeBufferGeometries(
                      colorMeshesMap[key].meshes.map(m => m.geometry),
                    ) as THREE.BufferGeometry
                    mesh.material = new MeshStandardMaterial({
                      color: colorMeshesMap[key].color,
                      transparent: colorMeshesMap[key].opacity < 1,
                      opacity: colorMeshesMap[key].opacity,
                    })
                    mesh.material.name = mesh.name + '_material'
                    result.materials[mesh.material.name] = mesh.material
                  }

                  result.nodes[mesh.name] = mesh // Collect mesh to return result later
                  _solid.add(mesh) // Add mesh to solid of the scene
                })
                part.add(_solid)
              } else {
                // Otherwise we can use the mesh itself
                const key = colorMeshes[0]
                const mesh = new Mesh()
                mesh.name = solidObject.name
                mesh.userData = { id: solidObject.id } // add solid id to the userData

                if (!options?.structureOnly) {
                  mesh.geometry = mergeBufferGeometries(
                    colorMeshesMap[key].meshes.map(m => m.geometry),
                  ) as THREE.BufferGeometry
                  mesh.material = new MeshStandardMaterial({
                    color: colorMeshesMap[key].color,
                    transparent: colorMeshesMap[key].opacity < 1,
                    opacity: colorMeshesMap[key].opacity,
                  })
                  mesh.material.name = mesh.name + '_material'
                  result.materials[mesh.material.name] = mesh.material
                }

                result.nodes[mesh.name] = mesh
                part.add(mesh)
              }
            }
          }
        }
      }
      root.add(part)
      result.nodes[part.name] = part
      result.nodes[`${object.id}`] = part
    }
  } else if (object.children) {
    // Assembly
    const assembly = new Group()
    const matrix = object.coordinateSystem ? MathUtils.convertToMatrix4(object.coordinateSystem) : new Matrix4()
    matrix.decompose(assembly.position, assembly.quaternion, assembly.scale)
    assembly.updateMatrix()
    assembly.userData = { id: object.id } // assembly root or instance id
    assembly.name = object.name // assembly root or instance name
    result.nodes[assembly.name] = assembly
    root.add(assembly)
    for (const child of object.children) {
      if (ccUtils.base.isA(tree[child].class, CCClasses.IProductReference)) {
        await createRecursiveScene(tree[child], drawingId, assembly, result, options)
      }
    }
  }
}
