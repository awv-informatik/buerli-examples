import { CCClasses } from '@buerli.io/classcad'
import * as plugins from '@buerli.io/react-cad'
import create, { SetState } from 'zustand'

const toc: { name: string; file?: string; mdFile?: string }[] = [
  { name: 'Intro', mdFile: 'Intro.md' },
  { name: 'engPart0', file: 'engPart0.of1' },
  { name: 'TestPart', file: 'TestPart.of1' },
  { name: 'engPart1', file: 'engPart1.of1' },
  { name: 'gripper', file: 'gripper.of1' },
  { name: 'SimpleBooleans', file: 'SimpleBooleans.of1' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  const markdown = t.mdFile ? import(`!!@mdx-js/loader!./docs/${t.mdFile}`) : null
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
  [plugins.Fillet.description.name]: CCClasses.CCConstantRadiusFillet,
  [plugins.Extrusion.description.name]: CCClasses.CCExtrusion,
  [plugins.Boolean.description.name]: CCClasses.CCUnion,
  [plugins.CircularPattern.description.name]: CCClasses.CCCircularPattern,
  //[plugins.Sketch.description.name]: CCClasses.CCSketch,
  // [plugins.Import.description.name]: CCClasses.CCImport,
}
const objectPlugins = Object.keys(objectPluginMap)

const pluginDocs: Record<string, Promise<{ default: any }>> = {}
for (const name of globalPlugins.concat(objectPlugins)) {
  pluginDocs[name] = import(`!!@mdx-js/loader!./docs/${objectPluginMap[name] || name}.md`)
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
