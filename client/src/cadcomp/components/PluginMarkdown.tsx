import { DrawingID } from '@buerli.io/core'
import { usePlugin } from '@buerli.io/react'
import React from 'react'
import { useStore } from '../store'
import { MarkdownLazy } from './MarkdownLazy'

export const PluginMarkdown: React.FC<{ drawingId: DrawingID }> = ({ drawingId }) => {
  const pluginDocs = useStore(s => s.pluginDocs)
  const activePlg = useStore(s => s.activePlugin)
  const pluginName = usePlugin(drawingId, activePlg, p => p?.name)
  const data = React.useMemo(() => {
    if (pluginName && pluginDocs[pluginName]) {
      return pluginDocs[pluginName]
    }
    return null
  }, [pluginDocs, pluginName])

  return data ? <MarkdownLazy data={data} /> : null
}
