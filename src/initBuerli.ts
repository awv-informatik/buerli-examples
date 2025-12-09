import { init, SocketIOClient } from '@buerli.io/classcad'
import { CCSERVERURL } from './config'

export const initBuerli = () => {
  init(id => new SocketIOClient(CCSERVERURL, id), {
    config: { geometry: { points: { hidden: true }, edges: { color: 'black' } } },
  })
}
