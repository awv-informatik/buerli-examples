import { init, SocketIOClient, WASMClient } from '@buerli.io/classcad'
import { CCSERVERURL } from './config'

import { classcadWasmKey } from './classcadWasmKey'

export const initBuerli = async () => {
  init(id => {
    if (classcadWasmKey) {
      return new WASMClient(id, { appKey: classcadWasmKey })
    } else {
      return new SocketIOClient(CCSERVERURL, id)
    }
  })
}
