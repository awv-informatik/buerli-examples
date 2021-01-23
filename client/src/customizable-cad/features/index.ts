import { CCClasses } from '@buerli.io/classcad'

const classes = Object.values(CCClasses) || []
const classMap: Record<string, any> = {}
for (const clazz of classes) {
  try {
    classMap[clazz] = require(`!babel-loader!@mdx-js/loader!./${clazz}.md`).default
  } catch (error) {}
}
export default classMap
export const featureDescCache = classMap
