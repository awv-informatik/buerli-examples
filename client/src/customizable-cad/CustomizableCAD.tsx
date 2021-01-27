import { Features } from '@awvinf/buerli-plugins'
import { CCClasses } from '@buerli.io/classcad'
import { DrawingID, getDrawing, PluginID, useBuerli, useDrawing, usePlugin } from '@buerli.io/core'
import { Canvas, Viewcube } from '@buerli.io/react'
import { MDXProvider } from '@mdx-js/react'
import { Spin } from 'antd'
import React from 'react'
import styled from 'styled-components'
import testpart from '../shared/resources/NxPart.of1'
import { ExampleCanvas3D, ExampleOptions, ExampleRightSidebar, ExampleWrapper } from '../shared/styles/Layout'
import { CCImportExport } from '../shared/utils/CCImportExport'
import { ErrorBoundary } from '../shared/utils/ErrorBoundary'
import { docs, globalPluginNames } from './docs'
import initBuerli from './initBuerli'

initBuerli()

/**
 * The application component.
 */
export const CustomizableCAD: React.FC<{}> = () => {
  const firstRender = React.useRef<boolean>(true)
  const activeDrawingId = useBuerli(buerli => buerli.drawing.active)
  const featurePlgIds = useDrawing(activeDrawingId, drawing => drawing.plugin.feature)

  const activeFeaturePluginId = useDrawing(activeDrawingId, drawing => drawing.plugin.active.feature)
  const activeGlobalPluginId = useDrawing(activeDrawingId, drawing => drawing.plugin.active.global[0])
  const activePluginId = activeGlobalPluginId ? activeGlobalPluginId : activeFeaturePluginId
  const hasActivePlg = Boolean(activeDrawingId) && Boolean(activePluginId)
  const isObjectPlg = hasActivePlg && !Boolean(activeGlobalPluginId)
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    document.title = 'Customizable CAD'
  }, [])

  React.useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      CCImportExport.createAndLoad1('TestPart.of1', testpart).finally(() => {
        setLoading(false)
      })
    }, 100)
  }, [])

  React.useEffect(() => {
    const dr = getDrawing(activeDrawingId)
    if (dr && firstRender.current) {
      for (const id of featurePlgIds) {
        if (dr.structure.tree[id].class === CCClasses.CCChamfer) {
          firstRender.current = false
          dr.api.plugin.setActiveFeature(id)
          break
        }
      }
    }
  }, [activeDrawingId, featurePlgIds])

  return (
    <ExampleWrapper>
      <FeaturesWrapper>
        {activeDrawingId && (
          <>
            <H4>Features</H4>
            <Features drawingId={activeDrawingId} />
            <div style={{ height: '15px' }} />
            <H4>Globals</H4>
            <ExampleOptions>
              <GlobalPluginSelector drawingId={activeDrawingId} />
            </ExampleOptions>
          </>
        )}
      </FeaturesWrapper>
      <ExampleCanvas3D>
        {activeDrawingId && (
          <Canvas drawingId={activeDrawingId} product controls plugins>
            <Viewcube drawingId={activeDrawingId} top={true} left={true} centerAxis={false} />
          </Canvas>
        )}
        {loading && (
          <div style={{ display: 'grid', justifyItems: 'center', zIndex: 1000 }}>
            <Spin size="large" />
            <span style={{ paddingLeft: '8px', color: 'dodgerblue', opacity: 0.8 }}>Loading...</span>
          </div>
        )}
      </ExampleCanvas3D>
      <ExampleRightSidebar style={{ overflow: 'auto', paddingRight: '10px' }}>
        {hasActivePlg && <PluginWrapper drawingId={activeDrawingId} pluginId={activePluginId} isObject={isObjectPlg} />}
        <div style={{ height: '30px' }} />
        {activeDrawingId && <DescriptionWrapper drawingId={activeDrawingId} />}
      </ExampleRightSidebar>
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
  const MDX = React.useMemo(() => {
    if (global.length > 0) {
      return docs[getDrawing(drawingId)?.plugin?.refs[global[0]].name]
    }
    return docs[feature?.class]
  }, [global, drawingId, feature])
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
        <H4>{pluginName}</H4>{' '}
        <H4
          style={{ justifySelf: 'flex-end', cursor: 'pointer' }}
          onClick={() => {
            if (isObject) {
              pluginApi?.setActiveFeature(null)
            } else {
              pluginApi?.setActiveGlobal(pluginId, false)
            }
          }}>
          ⤫
        </H4>
      </div>
      <ErrorBoundary>{domUI}</ErrorBoundary>
    </div>
  )
}

const GlobalPluginSelector: React.FC<{ drawingId: DrawingID }> = ({ drawingId }) => {
  const [activeName, setActiveName] = React.useState<string>('')
  const pluginApi = useDrawing(drawingId, drawing => drawing.api.plugin)
  const active = useDrawing(drawingId, drawing => drawing.plugin.active)

  const activate = React.useCallback(
    (name: string) => {
      const dr = getDrawing(drawingId)
      if (dr) {
        const pluginId = dr.plugin.global.find(id => {
          return dr.plugin.refs[id].name === name ? id : undefined
        })
        for (const globalId of active.global) {
          pluginApi.setActiveGlobal(globalId, globalId === pluginId)
        }
        pluginApi.setActiveGlobal(pluginId, active.global.indexOf(pluginId) < 0)
      }
    },
    [pluginApi, drawingId, active],
  )

  React.useEffect(() => {
    if (active.global.length <= 0) {
      setActiveName('')
    } else {
      const dr = getDrawing(drawingId)
      if (dr) {
        const name = dr.plugin.refs[active.global[0]].name
        setActiveName(name)
      }
    }
  }, [pluginApi, drawingId, active])

  return (
    <>
      {globalPluginNames.map(o =>
        // only show the global plugins which have a documentation file
        docs[o] ? (
          <div key={o} onClick={() => activate(o)} className={o === activeName ? 'active' : ''}>
            {o}
          </div>
        ) : null,
      )}
    </>
  )
}

const H4 = styled.div`
  padding: 0 0 8px 0;
  font-size: 16.5px;
  font-weight: bold;
`

const FeaturesWrapper = styled.div`
  grid-row: 1 / 3;
  grid-column: 1 / 2;
  overflow: auto;
  padding-right: 5px;
  span {
    font-size: 15px;
    padding: 0 0 1px 0;
    color: inherit;
  }
  svg {
    fill: rgb(107, 113, 119);
  }
`
