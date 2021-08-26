import { DrawingID } from '@buerli.io/core'
import { useDrawing, usePlugin } from '@buerli.io/react'
import React from 'react'
import styled from 'styled-components'
import { ErrorBoundary } from '../../shared/utils/ErrorBoundary'
import { useStore } from '../store'

export const PluginUI: React.FC<{ drawingId: DrawingID }> = ({ drawingId }) => {
  const pluginApi = useDrawing(drawingId, d => d.api.plugin)
  const pluginId = useStore(s => s.activePlugin)
  const PluginRoot = usePlugin(drawingId, pluginId, p => p?.Root)
  const pluginName = usePlugin(drawingId, pluginId, p => p?.name)
  const domUI = PluginRoot ? <PluginRoot drawingId={drawingId} pluginId={pluginId} /> : null
  return domUI ? (
    <div style={{ paddingBottom: '20px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px' }}>
        <H4>{pluginName}</H4>{' '}
        <H4
          style={{ justifySelf: 'flex-end', cursor: 'pointer' }}
          onClick={() => {
            pluginApi?.setActiveGlobal(pluginId, false)
            pluginApi?.setActiveFeature(null)
          }}>
          ⤫
        </H4>
      </div>
      <ErrorBoundary>{domUI}</ErrorBoundary>
    </div>
  ) : null
}

const H4 = styled.div`
  padding: 0 0 8px 0;
  font-size: 16.5px;
  font-weight: bold;
`
