import { ccAPI } from '@buerli.io/classcad'
import { api as buerliApi, DrawingID, useBuerli } from '@buerli.io/core'
import { FeatureList } from '@buerli.io/plugins'
import { Canvas, Viewcube } from '@buerli.io/react'
import { extname } from 'path'
import React from 'react'
import styled from 'styled-components'
import { CanvasContainer, ExampleLayout, Spin } from '../shared/components'
import { ExampleList } from './components/ExampleList'
import { GlobalPluginList } from './components/GlobalPluginList'
import { MarkdownLazy } from './components/MarkdownLazy'
import { PluginController } from './components/PluginController'
import { PluginMarkdown } from './components/PluginMarkdown'
import { PluginUI } from './components/PluginUI'
import { Validator } from './components/Validator'
import initBuerli from './initBuerli'
import { useStore } from './store'

initBuerli()

/**
 * The application component.
 */
export const CustomizableCAD: React.FC<{}> = () => {
  const api = useBuerli(b => b.api)
  const activeDrId = useBuerli(b => b.drawing.active)
  const drawingId = React.useRef<DrawingID | undefined>()
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  const activePlg = useStore(s => s.activePlugin)
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    document.title = 'Customizable'
  }, [])

  React.useEffect(() => {
    const run = async () => {
      if (!example || !example.model.data) return
      setLoading(true)
      try {
        const content = (await example.model.data).default
        const drId = await ccAPI.base.createCCDrawing()
        if (drId) {
          drawingId.current = drId
          const type = extname(example.model.file).replace('.', '')
          await ccAPI.baseModeler.load(drId, content, type, example.model.file)
          api.setActiveDrawing(drId)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    run()

    return () => {
      drawingId.current && buerliApi.getState().api.removeDrawing(drawingId.current)
    }
  }, [example, api, drawingId])
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {activeDrId && <PluginController drawingId={activeDrId} />}
      <ExampleLayout>
        <ExampleList />
        {example?.markdown?.data && !activeDrId && <MarkdownLazy data={example.markdown.data} />}
        {activeDrId && (
          <CanvasContainer>
            {loading && <Spin />}
            <Canvas drawingId={activeDrId} product controls plugins>
              <Viewcube drawingId={activeDrId} top={true} left={false} centerAxis={false} />
            </Canvas>
            <div style={{ height: '100%', justifySelf: 'flex-start', overflow: 'auto', zIndex: 1000 }}>
              <H4>Features</H4>
              <div className="features">
                <Validator drawingId={activeDrId} needsDrawing needsCurrentProduct>
                  <FeatureList drawingId={activeDrId} />
                </Validator>
              </div>
              <div style={{ height: '15px' }} />
              <H4>Globals</H4>
              <GlobalPluginList drawingId={activeDrId} />
            </div>
          </CanvasContainer>
        )}
        {activeDrId && activePlg && (
          <div>
            <PluginUI drawingId={activeDrId} />
            <PluginMarkdown drawingId={activeDrId} />
          </div>
        )}
      </ExampleLayout>
    </div>
  )
}

export default CustomizableCAD

const H4 = styled.div`
  padding: 0 0 8px 0;
  font-size: 16.5px;
  font-weight: bold;
`
