import { Color, Mesh, MeshStandardMaterial, Object3D } from 'three'

/**
 * Traverses over the whole object and looks for all objects with id === object.userData.
 * @param id id of the object to look for
 * @param object object where to look for the id
 * @returns array of all found objects
 */
export const findObjectsById = (id: number, object: THREE.Object3D): Object3D[] => {
  const foundObjects: Object3D[] = []
  object.traverse(obj => {
    if (obj.userData['id'] === id) {
      const foundChild: Object3D = new Mesh()
      foundChild.copy(obj)
      foundObjects.push(foundChild)
      return
    }
  })
  return foundObjects
}

/**
 * Traverses over the whole object and looks for all objects with name === object.name.
 * @param name name of the object to look for
 * @param object object where to look for the name
 * @returns array of all found objects
 */
export const findObjectsByName = (name: string, object: THREE.Object3D): Object3D[] => {
  const foundObjects: Object3D[] = []
  object.traverse(obj => {
    if (obj.name === name) {
      const foundChild: Object3D = new Mesh()
      foundChild.copy(obj, true)
      foundObjects.push(foundChild)
      return
    }
  })
  return foundObjects
}

/**
 * Sets the color for the object and all its children.
 * @param object object to set color on
 * @param color color to set on the object and its children
 */
export const setObjectColor = (
  object: THREE.Object3D,
  color: Color,
) => {
  if (object && object.children.length > 0) {
    if (object.children[0].type === 'Group') {
      object.children.forEach(child => {
        setObjectColor(child, color)
      })
    } else if (object.children[0].type === 'Mesh') {
      object.children.forEach(child => {
        const mat = (child as Mesh).material as MeshStandardMaterial
        mat.color = color
      })
    }
  }
}

/**
 * Sets the transparency for the object and all its children.
 * @param object object to set color on
 * @param transparency transparency (0 - 1) to set on the object and its children
 */
export const setObjectTransparency = (
  object: THREE.Object3D,
  transparency: number,
) => {
  if (transparency > 1 || transparency < 0) return
  if (object && object.children.length > 0) {
    if (object.children[0].type === 'Group') {
      object.children.forEach(child => {
        setObjectTransparency(child, transparency)
      })
    } else if (object.children[0].type === 'Mesh') {
      object.children.forEach(child => {
        const mat = (child as Mesh).material as MeshStandardMaterial
        mat.transparent = transparency > 0
        mat.opacity = 1 - transparency
      })
    }
  }
}
