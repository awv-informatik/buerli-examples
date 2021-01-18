import { Viewcube } from '@awvinf/buerli-plugins'
import { DrawingID, PluginID, useBuerli, useDrawing, usePlugin } from '@buerli.io/core'
import { Canvas, Plugin } from '@buerli.io/react'
import React from 'react'
import testpart from '../shared/resources/NxPart.of1'
import { AppGrid, CanvasCells, CanvasContainer, GlobalPluginsCells, MainGrid } from '../shared/styles/Layout'
import { CCImportExport } from '../shared/utils/CCImportExport'
import { ErrorBoundary } from '../shared/utils/ErrorBoundary'
import initBuerli from './initBuerli'

initBuerli()

const ViewCube: any = Viewcube.View

/**
 * The application component.
 */
export const CustomizableCAD: React.FC<{}> = () => {
  const activeDrawingId = useBuerli(buerli => buerli.drawing.active)
  const pluginApi = useDrawing(activeDrawingId, drawing => drawing.api.plugin)
  const globalPlgIds = useDrawing(activeDrawingId, drawing => drawing.plugin.global)

  const activePluginId = useDrawing(activeDrawingId, drawing => drawing.plugin.active.feature) || -1
  const hasActivePlg = activeDrawingId && activePluginId >= 0

  React.useEffect(() => {
    document.title = 'Customizable CAD'
  }, [])

  React.useEffect(() => {
    if (globalPlgIds) globalPlgIds.forEach(id => pluginApi.setVisiblePlugin(id, true))
  }, [globalPlgIds, pluginApi])

  React.useEffect(() => {
    setTimeout(() => {
      CCImportExport.createAndLoad1('TestPart.of1', testpart)
    }, 500)
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
        <GlobalPluginsCells>
          <div>
            {globalPlgIds &&
              globalPlgIds.map(id => <PluginWrapper key={id} drawingId={activeDrawingId} pluginId={id} />)}
            {hasActivePlg && <PluginWrapper drawingId={activeDrawingId} pluginId={activePluginId} isObject />}
          </div>
        </GlobalPluginsCells>
      </AppGrid>
    </MainGrid>
  )
}

export default CustomizableCAD

const PluginWrapper: React.FC<{ drawingId: DrawingID; pluginId: PluginID; isObject?: boolean }> = ({
  drawingId,
  pluginId,
  isObject,
}) => {
  const pluginApi = useDrawing(drawingId, d => d.api.plugin)
  const PluginRoot = usePlugin(drawingId, pluginId, d => d.Root)
  const pluginName = usePlugin(drawingId, pluginId, d => d.name)
  const domUI = PluginRoot ? <PluginRoot drawingId={drawingId} pluginId={pluginId} /> : null
  return (
    <div style={{ paddingBottom: '20px' }}>
      <div>
        {!isObject && <h4>{pluginName}</h4>}
        {isObject && <h3 style={{ float: 'left', paddingBottom: '10px' }}>{pluginName}</h3>}
        {isObject && (
          <h4
            style={{ float: 'right', padding: 0, margin: 0, lineHeight: '2.3em', cursor: 'pointer' }}
            onClick={() => pluginApi?.setActiveFeature(null)}>
            X
          </h4>
        )}
      </div>
      <ErrorBoundary>{domUI}</ErrorBoundary>
    </div>
  )
}
