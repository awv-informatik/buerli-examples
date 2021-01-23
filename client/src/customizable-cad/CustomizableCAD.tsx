import { Features } from '@awvinf/buerli-plugins'
import { DrawingID, PluginID, useBuerli, useDrawing, usePlugin } from '@buerli.io/core'
import { Canvas, Viewcube } from '@buerli.io/react'
import React from 'react'
import styled from 'styled-components'
import testpart from '../shared/resources/NxPart.of1'
import { ExampleCanvas3D, ExampleCode, ExampleDescription, ExampleWrapper } from '../shared/styles/Layout'
import { CCImportExport } from '../shared/utils/CCImportExport'
import { ErrorBoundary } from '../shared/utils/ErrorBoundary'
import initBuerli from './initBuerli'
import { featureDescCache } from './features'
import { MDXProvider } from '@mdx-js/react'

initBuerli()

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
    <ExampleWrapper>
      <FeaturesWrapper>{activeDrawingId && <Features drawingId={activeDrawingId} />}</FeaturesWrapper>
      <ExampleCanvas3D>
        {activeDrawingId && (
          <Canvas drawingId={activeDrawingId} product controls plugins>
            <Viewcube drawingId={activeDrawingId} top={true} left={true} centerAxis={false} />
          </Canvas>
        )}
      </ExampleCanvas3D>
      <ExampleCode style={{ overflow: 'auto', paddingRight: '5px' }}>
        {hasActivePlg && <PluginWrapper drawingId={activeDrawingId} pluginId={activePluginId} isObject />}
      </ExampleCode>
      <ExampleDescription style={{ overflow: 'auto', padding: '10px 5px 0 0' }}>
        {activeDrawingId && <DescriptionWrapper drawingId={activeDrawingId} />}
      </ExampleDescription>
    </ExampleWrapper>
  )
}

export default CustomizableCAD

const components = {
  // Prevent page props from being passed to MDX wrapper
  wrapper: (props: any) => <>{props.children}</>,
  p: (props: any) => <p {...props} style={{ fontSize: '14px' }} />,
}

const DescriptionWrapper: React.FC<{ drawingId: DrawingID }> = ({ drawingId }) => {
  const { feature: featureId, global } = useDrawing(drawingId, d => d.plugin.active)
  const feature = useDrawing(drawingId, d => d.structure.tree[featureId])
  const MDX = featureDescCache[feature?.class]
  return MDX ? (
    <div style={{ fontSize: '!important inherit' }}>
      <MDXProvider components={components}>
        <MDX />
      </MDXProvider>
    </div>
  ) : null
}

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
    <div style={{ paddingBottom: '20px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px' }}>
        {!isObject && <H4>{pluginName}</H4>}
        {isObject && <H4>{pluginName}</H4>}
        {isObject && (
          <H4 style={{ justifySelf: 'flex-end', cursor: 'pointer' }} onClick={() => pluginApi?.setActiveFeature(null)}>
            ⤫
          </H4>
        )}
      </div>
      <ErrorBoundary>{domUI}</ErrorBoundary>
    </div>
  )
}

const H4 = styled.div`
  padding: 0 0 5px 3px;
  font-size: 16.5px;
  font-weight: bold;
`

const FeaturesWrapper = styled.div`
  grid-row: 1 / 3;
  grid-column: 1 / 2;
  overflow: hidden;
  span {
    font-size: 15px;
    padding: 0 0 1px 0;
    color: inherit;
  }
  svg {
    fill: rgb(107, 113, 119);
  }
`
