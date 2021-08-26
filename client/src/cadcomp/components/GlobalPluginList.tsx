import { DrawingID, getDrawing } from '@buerli.io/core'
import { useDrawing } from '@buerli.io/react'
import React from 'react'
import { Options } from '../../shared/components'
import { useStore } from '../store'

export const GlobalPluginList: React.FC<{ drawingId: DrawingID }> = ({ drawingId }) => {
  const globalPlugins = useStore(s => s.globalPlugins)
  const pluginDocs = useStore(s => s.pluginDocs)
  const [activeName, setActiveName] = React.useState<string>('')
  const pluginApi = useDrawing(drawingId, drawing => drawing.api.plugin)
  const active = useDrawing(drawingId, drawing => drawing.plugin.active)

  const activate = React.useCallback(
    (name: string) => {
      setActiveName(name)
      const dr = getDrawing(drawingId)
      if (dr) {
        const pluginId = dr.plugin.global.find(id => {
          return dr.plugin.refs[id].name === name ? id : undefined
        })
        pluginApi.setActiveFeature(null)
        for (const globalId of active.global) {
          pluginApi.setActiveGlobal(globalId, false)
        }
        setTimeout(() => pluginApi.setActiveGlobal(pluginId, true), 1)
      }
    },
    [pluginApi, drawingId, active, setActiveName],
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

  const options = React.useMemo(() => {
    // only show the global plugins which have a documentation file
    return globalPlugins.filter(n => Boolean(pluginDocs[n]))
  }, [pluginDocs, globalPlugins])

  return <Options values={options} onChange={activate} active={activeName} />
}
