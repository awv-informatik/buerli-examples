import { Features } from '@awvinf/buerli-plugins'
import { DrawingID, PluginID } from '@buerli.io/core'
import React from 'react'

export const Root: React.FC<{ drawingId: DrawingID; pluginId: PluginID }> = ({ drawingId, pluginId }) => {
  return drawingId ? (
    <div>
      <Features drawingId={drawingId} />
    </div>
  ) : null
}
