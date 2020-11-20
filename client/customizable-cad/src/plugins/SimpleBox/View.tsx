import { DrawingID, PluginID, usePlugin } from '@buerli.io/core'
import React from 'react'
import * as THREE from 'three'

export const View: React.FC<{ drawingId: DrawingID; pluginId: PluginID }> = ({ drawingId, pluginId }) => {
  const visible = usePlugin(drawingId, pluginId, p => p.state.visible)
  return visible ? <Box drawingId={drawingId} pluginId={pluginId} /> : null
}

const Box: React.FC<{ drawingId: DrawingID; pluginId: PluginID }> = ({ drawingId, pluginId }) => {
  const x = usePlugin(drawingId, pluginId, p => p.state.x)
  const y = usePlugin(drawingId, pluginId, p => p.state.y)
  const z = usePlugin(drawingId, pluginId, p => p.state.z)
  const w = usePlugin(drawingId, pluginId, p => p.state.w)
  const h = usePlugin(drawingId, pluginId, p => p.state.h)
  const d = usePlugin(drawingId, pluginId, p => p.state.d)

  const geometry = new THREE.BoxBufferGeometry(w, h, d)
  const material = new THREE.MeshBasicMaterial({ color: 'cyan' })
  return <mesh scale={[1, 1, 1]} position={[x, y, z]} key={pluginId} material={material} geometry={geometry} />
}
