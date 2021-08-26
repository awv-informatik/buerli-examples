import { ccAPI } from '@buerli.io/classcad'
import { api as buerliApi, DrawingID } from '@buerli.io/core'
import { Drawing } from '@buerli.io/plugins'
import { useBuerli } from '@buerli.io/react'
import { extname } from 'path'
import React from 'react'
import { CanvasContainer, ExampleLayout, Spin } from '../shared/components'
import { ExampleList } from './components/ExampleList'
import { MarkdownLazy } from './components/MarkdownLazy'
import { PluginController } from './components/PluginController'
import { PluginMarkdown } from './components/PluginMarkdown'
import { PluginUI } from './components/PluginUI'
import initBuerli from './initBuerli'
import { useStore } from './store'

initBuerli()

/**
 * The application component.
 */
export const CustomizableCAD: React.FC = () => {
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
          <CanvasContainer style={{ padding: '40px' }}>
            {loading && <Spin />}
            <div
              style={{
                borderRadius: '6px',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                background: '#f0f0f0',
              }}>
              <Drawing drawingId={activeDrId} />
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
