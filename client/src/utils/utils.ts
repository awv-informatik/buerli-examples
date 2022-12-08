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
 * Sets the color for all objects and their children in the given owner object, which correspond to the node with name or id = nameOrId.
 * If multiple objects have the same name, all objects will be colored
 * @param nameOrId name or id of the object to set color on
 * @param color color to set on the object corresponding to nameOrId
 * @param ownerObject object which is the owner of the objects to color with corresponding nameOrId
 */
export const setObjectColor = (
  nameOrId: string | number,
  color: Color,
  ownerObject: THREE.Object3D,
) => {
  const objects: Object3D[] =
    typeof nameOrId === 'string'
      ? findObjectsByName(nameOrId, ownerObject)
      : findObjectsById(nameOrId, ownerObject)
  objects.forEach(object => {
    if (object && object.children.length > 0) {
      if (object.children[0].type === 'Group') {
        object?.children.forEach(child => {
          setObjectColor(child.name, color, object)
        })
      } else if (object.children[0].type === 'Mesh') {
        object.children.forEach(child => {
          const mat = (child as Mesh).material as MeshStandardMaterial
          mat.color = color
        })
      }
    }
  })
}

/**
 * Sets the transparency for all objects and their children in the owner object, which correspond to the node with name or id = nameOrId.
 * If multiple objects have the same name, all objects will set to transparent.
 * @param nameOrId name or id of the object to set color on
 * @param transparency transparency (0 - 1) to set on the object corresponding to nameOrId. 1 = completely transparent
 * @param ownerObject object which is the owner of the objects to set transparency on with corresponding nameOrId
 */
export const setObjectTransparency = (
  nameOrId: string | number,
  transparency: number,
  ownerObject: THREE.Object3D,
) => {
  if (transparency > 1 || transparency < 0) return
  const objects: Object3D[] =
    typeof nameOrId === 'string'
      ? findObjectsByName(nameOrId, ownerObject)
      : findObjectsById(nameOrId, ownerObject)
  objects.forEach(object => {
    if (object && object.children.length > 0) {
      if (object.children[0].type === 'Group') {
        object?.children.forEach(child => {
          setObjectTransparency(child.name, transparency, object)
        })
      } else if (object.children[0].type === 'Mesh') {
        object.children.forEach(child => {
          const mat = (child as Mesh).material as MeshStandardMaterial
          mat.transparent = transparency > 0
          mat.opacity = 1 - transparency
        })
      }
    }
  })
}
