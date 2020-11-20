import { Viewcube } from '@awvinf/buerli-plugins'
import { DrawingID, PluginID, useBuerli, useDrawing, usePlugin } from '@buerli.io/core'
import { Canvas, Plugin } from '@buerli.io/react'
import React from 'react'
import {
  AppGrid,
  CanvasCells,
  CanvasContainer,
  GlobalPluginsCells,
  MainGrid,
  MenuCells,
  ObjectPluginsCells,
} from './styles/Layout'
import { CCImportExport } from './utils/CCImportExport'
import { FileUtils } from './utils/FileUtils'

const ViewCube: any = Viewcube.View

/**
 * The application component.
 */
export const App: React.FC<{}> = () => {
  const activeDrawingId = useBuerli(buerli => buerli.drawing.active)
  const pluginApi = useDrawing(activeDrawingId, drawing => drawing.api.plugin)
  const globalPlgIds = useDrawing(activeDrawingId, drawing => drawing.plugin.global)

  const activePluginId = useDrawing(activeDrawingId, drawing => drawing.plugin.active.feature) || -1
  const hasActivePlg = activeDrawingId && activePluginId >= 0

  React.useEffect(() => {
    if (globalPlgIds) globalPlgIds.forEach(id => pluginApi.setVisiblePlugin(id, true))
  }, [globalPlgIds, pluginApi])

  const load = React.useCallback(() => {
    const run = async () => {
      FileUtils.loadFile((f, c) => {
        CCImportExport.createAndLoad(f)
      })
    }
    run()
  }, [])

  return (
    <MainGrid>
      <AppGrid>
        {activeDrawingId && (
          <CanvasCells>
            <CanvasContainer>
              <Canvas drawingId={activeDrawingId} product controls plugins>
                {globalPlgIds &&
                  globalPlgIds.map(id => <Plugin view key={id} drawingId={activeDrawingId} pluginId={id} />)}
                <ViewCube drawingId={activeDrawingId} top={true} left={false} centerAxis={false} />
              </Canvas>
            </CanvasContainer>
          </CanvasCells>
        )}
        <MenuCells>
          <span style={{ cursor: 'pointer' }} onClick={load}>
            Open
          </span>
        </MenuCells>
        <GlobalPluginsCells>
          {globalPlgIds && globalPlgIds.map(id => <PluginWrapper key={id} drawingId={activeDrawingId} pluginId={id} />)}
        </GlobalPluginsCells>
        {hasActivePlg && (
          <ObjectPluginsCells>
            <PluginWrapper drawingId={activeDrawingId} pluginId={activePluginId} isObject />
          </ObjectPluginsCells>
        )}
      </AppGrid>
    </MainGrid>
  )
}

export default App

const PluginWrapper: React.FC<{ drawingId: DrawingID; pluginId: PluginID; isObject?: boolean }> = ({
  drawingId,
  pluginId,
  isObject,
}) => {
  const pluginApi = useDrawing(drawingId, d => d.api.plugin)
  const PluginRoot = usePlugin(drawingId, pluginId, d => d.Root)
  const pluginName = usePlugin(drawingId, pluginId, d => d.name)
  const view = PluginRoot ? <PluginRoot drawingId={drawingId} pluginId={pluginId} /> : null
  return (
    <div style={{ paddingBottom: '20px' }}>
      <div>
        {!isObject && <h3>{pluginName}</h3>}
        {isObject && <h3 style={{ float: 'left', paddingBottom: '10px' }}>{pluginName}</h3>}
        {isObject && (
          <h4
            style={{ float: 'right', padding: 0, margin: 0, lineHeight: '2.3em', cursor: 'pointer' }}
            onClick={() => pluginApi?.setActiveFeature(null)}>
            X
          </h4>
        )}
      </div>
      {view}
    </div>
  )
}
