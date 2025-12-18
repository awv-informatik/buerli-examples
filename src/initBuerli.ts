import { init, SocketIOClient, WASMClient } from '@buerli.io/classcad'
import { CCSERVERURL } from './config'

const classcadKey = process.env.CLASSCADKEY

export const initBuerli = async () => {
  init(id => {
    if (classcadKey) {
      return new WASMClient(id, { classcadKey })
    } else {
      return new SocketIOClient(CCSERVERURL, id)  // TODO: URL also in .env?
    }
  })
}
