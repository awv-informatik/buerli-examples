/* eslint-disable @typescript-eslint/camelcase */
import { BoundingBoxInfo, Measure } from '@awvinf/buerli-plugins'
import { init } from '@buerli.io/core'
import { elements } from '@buerli.io/react'
import * as Drawings from './plugins/DrawingsList'
import * as Features from './plugins/FeaturesList'
import * as SimpleBox from './plugins/SimpleBox'

export const initBuerli = () => {
  init({
    url: 'http://localhost:8081',
    elements,
    globalPlugins: [Drawings, Features, SimpleBox, Measure, BoundingBoxInfo],
    plugins: {},
    theme: {
      primary: '#e36b7c',
      secondary: '#fcc7cb',
      dark: '#a0a0a0',
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
