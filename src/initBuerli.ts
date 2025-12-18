/* eslint-disable @typescript-eslint/ban-ts-comment */
import { init, SocketIOClient, WASMClient } from '@buerli.io/classcad'

// @ts-ignore
const classcadWasmKey = CLASSCAD_WASM_KEY
// @ts-ignore
const socketIoUrl = SOCKETIO_URL

export const initBuerli = async () => {
  init(id => {
    if (classcadWasmKey) {
      return new WASMClient(id, { classcadKey: classcadWasmKey, logToConsole: true })
    } else {
      return new SocketIOClient(socketIoUrl, id)
    }
  })
}
