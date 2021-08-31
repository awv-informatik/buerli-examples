import { CCClasses } from '@buerli.io/classcad'
import { init, Plugin } from '@buerli.io/core'
import { elements } from '@buerli.io/react'
import * as plugins from '@buerli.io/react-cad'
import { CCSERVERURL } from '../config'

const pluginsArray = Object.values(plugins) as Plugin[]
const globalPlugins = pluginsArray.filter(p => Boolean(p.description) && p.description.global) as Plugin[]

export const initBuerli = () => {
  init({
    url: CCSERVERURL,
    elements,
    globalPlugins,
    plugins: {
      [CCClasses.CCSketch]: plugins.Sketch,
      [CCClasses.CCExtrusion]: plugins.Extrusion,
      [CCClasses.CCChamfer]: plugins.Chamfer,
      [CCClasses.CCConstantRadiusFillet]: plugins.Fillet,
      [CCClasses.CCUnion]: plugins.Boolean,
      [CCClasses.CCWorkAxis]: plugins.WorkAxis,
      [CCClasses.CCWorkPlane]: plugins.WorkPlane,
      [CCClasses.CCWorkPoint]: plugins.WorkPoint,
    },
    theme: {
      primary: 'rgba(0,0,0,0)',
      secondary: 'rgba(0,0,0,0)',
      dark: 'rgba(0,0,0,0.1)',
      highlightedGeom: '#e36b7c',
      hoveredGeom: '#40a9ff',
    },
    config: {
      geometry: {
        disabled: false,
        edges: { hidden: false, opacity: 1.0, color: 'black' },
        points: { hidden: true, opacity: 1.0, color: 'black' },
        meshes: { hidden: false, opacity: 1.0, wireframe: false },
      },
    },
  })
}

export default initBuerli
