/* eslint-disable @typescript-eslint/camelcase */
import { init } from '@buerli.io/core'
import { elements } from '@buerli.io/react'

export const initBuerli = () => {
  init({
    url: 'https://02.service.classcad.ch',
    elements,
    globalPlugins: [],
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
