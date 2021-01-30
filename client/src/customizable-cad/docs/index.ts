import { CCClasses } from '@buerli.io/classcad'
import * as plugins from '@buerli.io/plugins'

export const globalPlugins = Object.values(plugins)
  .map(p => p)
  .filter((p: any) => Boolean(p.description) && p.description.global) as any[]

export const globalPluginNames = globalPlugins.map(p => p.description.name).sort()

const docNames = Object.values(CCClasses).concat(globalPluginNames)
const docsMap: Record<string, any> = {}
for (const clazz of docNames) {
  try {
    docsMap[clazz] = require(`!babel-loader!@mdx-js/loader!./${clazz}.md`).default
  } catch (error) {}
}

export default docsMap
export const docs = docsMap
