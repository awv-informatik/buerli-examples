import { CCClasses } from '@buerli.io/classcad'
import * as plugins from '@buerli.io/plugins'
import create, { SetState } from 'zustand'

const toc: { name: string; file?: string; mdFile?: string }[] = [
  { name: 'Intro', mdFile: 'Intro.md' },
  { name: 'Chamfer', file: 'NxPart.of1' },
  { name: 'TestPart', file: 'TestPart.of1' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  const markdown = t.mdFile ? import(`!babel-loader!@mdx-js/loader!./docs/${t.mdFile}`) : null
  const cadModel = t.file ? import(`!!arraybuffer-loader!./../shared/resources/${t.file}`) : null
  exampleMap[t.name] = {
    label: t.name,
    markdown: { file: t.mdFile, data: markdown },
    model: { file: t.file, data: cadModel },
  }
}

const globalPlugins = [
  plugins.Measure.description.name,
  plugins.Expressions.description.name,
  plugins.BoundingBoxInfo.description.name,
]

const objectPluginMap = {
  [plugins.Chamfer.description.name]: CCClasses.CCChamfer,
  [plugins.Extrusion.description.name]: CCClasses.CCExtrusion,
}
const objectPlugins = Object.keys(objectPluginMap)

const pluginDocs: Record<string, Promise<{ default: any }>> = {}
for (const name of globalPlugins.concat(objectPlugins)) {
  pluginDocs[name] = import(`!babel-loader!@mdx-js/loader!./docs/${objectPluginMap[name] || name}.md`)
}

const useStore = create<State>(set => ({
  activeExample: toc[0].name,
  examples: { ids: Object.keys(exampleMap), objs: exampleMap },
  globalPlugins,
  objectPlugins,
  pluginDocs,
  set,
}))

export { useStore }

// *****************************************
// *****************************************
// TYPES

type State = Readonly<{
  examples: { ids: string[]; objs: Record<string, Example> }
  globalPlugins: string[]
  objectPlugins: string[]
  pluginDocs: Record<string, Promise<{ default: any }>>
  activeExample?: string
  activePlugin?: string | number
  set: SetState<State>
}>

type Example = {
  label: string
  markdown?: { file: string; data: Promise<{ default: any }> }
  model?: { file: string; data: Promise<{ default: any }> }
}
