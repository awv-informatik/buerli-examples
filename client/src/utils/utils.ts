import { Color, Mesh, MeshStandardMaterial, Object3D } from 'three'

/**
 * Traverses over the whole scene and looks for all objects with id === object.userData.
 * @param id id of the object to look for
 * @param scene scene where to look for the objects
 * @returns array of all found objects
 */
export const findObjectsById = (id: number, scene: THREE.Scene): Object3D[] => {
  const foundObjects: Object3D[] = []
  scene.traverse(object => {
    if (object.userData['id'] === id) {
      const foundChild: Object3D = new Mesh()
      foundChild.copy(object)
      foundObjects.push(foundChild)
      return
    }
  })
  return foundObjects
}

/**
 * Traverses over the whole scene and looks for all objects with name === object.name.
 * @param name name of the object to look for
 * @param scene scene where to look for the objects
 * @returns array of all found objects
 */
export const findObjectsByName = (name: string, scene: THREE.Scene): Object3D[] => {
  const foundObjects: Object3D[] = []
  scene.traverse(object => {
    if (object.name === name) {
      const foundChild: Object3D = new Mesh()
      foundChild.copy(object, true)
      foundObjects.push(foundChild)
      return
    }
  })
  return foundObjects
}

/**
 * Sets the color for all objects in the scene, which correspond to the node with name or id = nameOrId.
 * If multiple nodes have the same name, all objects will be colored
 * @param nameOrId name or id of the node to set color on
 * @param color color to set on the object which correspond to the node
 * @param scene scene where to color the objects
 */
export const setNodesColor = (nameOrId: string | number, color: Color, scene: THREE.Scene) => {
  const nodes: Object3D[] =
    typeof nameOrId === 'string'
      ? findObjectsByName(nameOrId, scene)
      : findObjectsById(nameOrId, scene)
  nodes.forEach(node => {
    if (node && node.children.length > 0 && node.children[0].type === 'Mesh') {
      node?.children.forEach(child => {
        const mat = (child as Mesh).material as MeshStandardMaterial
        mat.color = color
      })
    }
  })
}

/**
 * Sets the color for all objects in the scene, which correspond to the solid with name or id = nameOrId.
 * If multiple solids have the same name, all objects will be colored
 * @param nameOrId name or id of the solid to set color on
 * @param color color to set on the object which correspond to the solid
 * @param scene scene where to color the objects
 */
export const setSolidsColor = (nameOrId: string | number, color: Color, scene: THREE.Scene) => {
  const solids: Object3D[] =
    typeof nameOrId === 'string'
      ? findObjectsByName(nameOrId, scene)
      : findObjectsById(nameOrId, scene)
      solids.forEach(solid => {
    if (solid && solid.type === 'Mesh') {
      const mat = (solid as Mesh).material as MeshStandardMaterial
      mat.color = color
    }
  })
}

/**
 * Sets the transparency for all objects in the scene, which correspond to the node with name or id = nameOrId.
 * If multiple nodes have the same name, all objects will set to transparent.
 * @param nameOrId name or id of the node to set color on
 * @param transparency transparency (0 - 1) to set on the object which correspond to the node. 1 = completely transparent
 * @param scene scene where the objects will be set to transparency
 */
export const setNodesTransparency = (
  nameOrId: string | number,
  transparency: number,
  scene: THREE.Scene,
) => {
  if (transparency > 1 || transparency < 0) return
  const nodes: Object3D[] =
    typeof nameOrId === 'string'
      ? findObjectsByName(nameOrId, scene)
      : findObjectsById(nameOrId, scene)
  nodes.forEach(node => {
    if (node && node.children.length > 0 && node.children[0].type === 'Mesh') {
      node?.children.forEach(child => {
        const mat = (child as Mesh).material as MeshStandardMaterial
        mat.transparent = transparency > 0
        mat.opacity = 1 - transparency
      })
    }
  })
}

/**
 * Sets the transparency for all objects in the scene, which correspond to the solid with name or id = nameOrId.
 * If multiple solids have the same name, all objects will set to transparent.
 * @param nameOrId name or id of the solid to set color on
 * @param transparency transparency (0 - 1) to set on the object which correspond to the solid. 1 = completely transparent
 * @param scene scene where the objects will be set to transparency
 */
export const setSolidsTransparency = (
  nameOrId: string | number,
  transparency: number,
  scene: THREE.Scene,
) => {
  if (transparency > 1 || transparency < 0) return
  const solids: Object3D[] =
    typeof nameOrId === 'string'
      ? findObjectsByName(nameOrId, scene)
      : findObjectsById(nameOrId, scene)
  solids.forEach(solid => {
    if (solid && solid.type === 'Mesh') {
      const mat = (solid as Mesh).material as MeshStandardMaterial
      mat.transparent = transparency > 0
      mat.opacity = 1 - transparency
    }
  })
}
