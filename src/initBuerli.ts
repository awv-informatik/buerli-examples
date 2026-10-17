import { init, SocketIOClient, WASMClient, WSClient } from '@buerli.io/classcad'

// Set in .env, see the README
const token = CLASSCAD_PUBLIC_TOKEN
const wsUrl = WS_URL
const socketIoUrl = SOCKETIO_URL

export const initBuerli = async () => {
  init(id => {
    if (token) return new WASMClient(id, { token })
    if (wsUrl) return new WSClient(wsUrl, id)
    if (socketIoUrl) return new SocketIOClient(socketIoUrl, id)
    throw new Error('No ClassCAD engine: set a public access token or a server address in .env (see the README)')
  })
}
