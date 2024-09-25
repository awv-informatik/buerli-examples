import { init, WASMClient } from '@buerli.io/classcad'

export const initBuerli = () => {
  init(id => new WASMClient('https://awvstatic.com/classcad/dev/wasm/20240925.1', id), {
    config: { geometry: { points: { hidden: true }, edges: { color: 'black' } } },
  })
}
