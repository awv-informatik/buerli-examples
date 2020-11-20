import { PluginDescription } from '@buerli.io/core'
import { Root } from './Root'

type InternalState = {}

const description: PluginDescription<InternalState> = {
  name: 'Features',
  version: '0.0.1',
  author: 'Custom',
  persistent: false,
  global: true,
}

export { Root, description }
