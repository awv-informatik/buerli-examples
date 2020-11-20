import { PluginDescription } from '@buerli.io/core'
import { Root } from './Root'
import { View } from './View'

type InternalState = {
  visible: boolean
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
}

const description: PluginDescription<InternalState> = {
  name: 'SimpleBox',
  version: '0.0.1',
  author: 'Custom',
  persistent: false,
  global: true,
  initialState: {
    visible: false,
    x: 0,
    y: 0,
    z: 0,
    w: 50,
    h: 50,
    d: 50,
  },
}

export { Root, View, description }
