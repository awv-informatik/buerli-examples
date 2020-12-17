import { CloseOutlined } from '@ant-design/icons'
import { DrawingID, getDrawing, PluginID, useBuerli } from '@buerli.io/core'
import React from 'react'
import styled from 'styled-components'

export const Root: React.FC<{ drawingId: DrawingID; pluginId: PluginID }> = ({ drawingId, pluginId }) => {
  const drawings = useBuerli(buerli => buerli.drawing.ids)
  const activeDrawing = useBuerli(buerli => buerli.drawing.active)
  const actions = useBuerli(buerli => buerli.actions)
  return drawings && drawings.length > 0 ? (
    <div style={{ display: 'grid' }}>
      {drawings.map(id => (
        <div key={id}>
          <ListEntry active={id === activeDrawing} onClick={() => actions.setActiveDrawing(id)}>
            {getDrawing(id).name}
            <div
              style={{ float: 'right', padding: '0 5px 0 0' }}
              onClick={e => {
                actions.removeDrawing(id)
                e.stopPropagation()
              }}>
              <CloseOutlined />
            </div>
          </ListEntry>
          <ListEntrySeparator />
        </div>
      ))}
    </div>
  ) : null
}

const ListEntry = styled.div<{ active?: boolean }>`
  cursor: pointer;
  padding: 0;
  border-style: solid;
  border-width: 0px 3px 0px 0px;
  border-color: ${props => (props.active ? 'cyan' : `transparent`)};
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  &:hover {
    background: lightcyan;
  }
`

const ListEntrySeparator = styled.div`
  width: 100%;
  height: 10px;
  background: transparent;
`
