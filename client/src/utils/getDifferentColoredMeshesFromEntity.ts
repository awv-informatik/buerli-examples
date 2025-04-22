import { ContainerGeometryT, MeshGeometry } from '@buerli.io/core'
import { Color } from 'three'

type ColorMeshMap = Record<string, { meshes: MeshGeometry[]; color: Color | undefined; opacity: number }>

/**
 * Get all meshes in a map, sorted by their color / opacity
 * @param entity entity to look for the meshes
 * @returns map (key = color/opacity as string, value = object containing the meshes, color and opacity)
 */
export const getDifferentColoredMeshesFromEntity = (entity: ContainerGeometryT) => {
  const colorMeshesMap: ColorMeshMap = {}
  entity.meshes.forEach(mesh => {
    const color = mesh.color ? mesh.color : entity.color
    const opacity = mesh.opacity ? mesh.opacity : entity.opacity
    const key: string = color?.getHexString() + opacity?.toString()
    if (colorMeshesMap[key]) {
      colorMeshesMap[key].meshes.push(mesh)
    } else {
      colorMeshesMap[key] = { meshes: [mesh], color, opacity }
    }
  })
  return colorMeshesMap
}
