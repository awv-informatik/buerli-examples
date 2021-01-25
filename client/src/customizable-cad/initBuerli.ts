/* eslint-disable @typescript-eslint/camelcase */
import { Boolean, Chamfer, Extrusion, Fillet, Sketch, WorkAxis, WorkPlane, WorkPoint } from '@awvinf/buerli-plugins'
import { CCClasses } from '@buerli.io/classcad'
import { init } from '@buerli.io/core'
import { elements } from '@buerli.io/react'
import { CCSERVERURL } from '../config'
import { globalPlugins } from './docs'

export const initBuerli = () => {
  init({
    url: CCSERVERURL,
    elements,
    globalPlugins,
    plugins: {
      [CCClasses.CCSketch]: Sketch,
      [CCClasses.CCExtrusion]: Extrusion,
      [CCClasses.CCChamfer]: Chamfer,
      [CCClasses.CCConstantRadiusFillet]: Fillet,
      [CCClasses.CCUnion]: Boolean,
      [CCClasses.CCWorkAxis]: WorkAxis,
      [CCClasses.CCWorkPlane]: WorkPlane,
      [CCClasses.CCWorkPoint]: WorkPoint,
    },
    theme: {
      primary: '#e36b7c',
      secondary: '#fcc7cb',
      dark: '#ffffff',
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
