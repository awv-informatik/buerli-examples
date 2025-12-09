import { init, SocketIOClient, WASMClient } from '@buerli.io/classcad'
import { CCSERVERURL } from './config'

import { classcadKey } from './classcadKey'

export const initBuerli = async () => {
  init(id => {
    if (classcadKey) {
      return new WASMClient(id, { appKey: classcadKey })
    } else {
      return new SocketIOClient(CCSERVERURL, id)
    }
  })
}
