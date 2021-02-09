import { DrawingID, useDrawing } from '@buerli.io/core'
import React from 'react'
import { useStore } from '../store'

export const PluginController: React.FC<{ drawingId: DrawingID }> = ({ drawingId }) => {
  const set = useStore(s => s.set)
  const objPlgId = useDrawing(drawingId, d => d.plugin.active.feature)
  const globalPlgId = useDrawing(drawingId, d => d.plugin.active.global[0])
  React.useEffect(() => set({ activePlugin: objPlgId }), [objPlgId])
  React.useEffect(() => set({ activePlugin: globalPlgId }), [globalPlgId])
  return null
}
