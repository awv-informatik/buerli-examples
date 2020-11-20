import { DrawingID, PluginID, usePlugin } from '@buerli.io/core'
import Checkbox from 'antd/lib/checkbox'
import Slider from 'antd/lib/slider'
import React from 'react'

export const Root: React.FC<{ drawingId: DrawingID; pluginId: PluginID }> = ({ drawingId, pluginId }) => {
  const set = usePlugin(drawingId, pluginId, p => p.set)
  const v = usePlugin(drawingId, pluginId, p => p.state.visible)
  const x = usePlugin(drawingId, pluginId, p => p.state.x)
  const y = usePlugin(drawingId, pluginId, p => p.state.y)
  const z = usePlugin(drawingId, pluginId, p => p.state.z)
  const w = usePlugin(drawingId, pluginId, p => p.state.w)
  const h = usePlugin(drawingId, pluginId, p => p.state.h)
  const d = usePlugin(drawingId, pluginId, p => p.state.d)
  return (
    <div>
      <Checkbox checked={v} onChange={e => set({ visible: e.target.checked })}>
        Show Box
      </Checkbox>
      {v && (
        <div>
          <Slider value={x} onChange={e => set({ x: e })} tipFormatter={e => `x=${e}`}></Slider>
          <Slider value={y} onChange={e => set({ y: e })} tipFormatter={e => `y=${e}`}></Slider>
          <Slider value={z} onChange={e => set({ z: e })} tipFormatter={e => `z=${e}`}></Slider>
          <Slider value={w} onChange={e => set({ w: e })} tipFormatter={e => `w=${e}`}></Slider>
          <Slider value={h} onChange={e => set({ h: e })} tipFormatter={e => `h=${e}`}></Slider>
          <Slider value={d} onChange={e => set({ d: e })} tipFormatter={e => `d=${e}`}></Slider>
        </div>
      )}
    </div>
  )
}
