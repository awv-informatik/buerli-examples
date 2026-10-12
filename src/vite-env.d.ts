/// <reference types="vite/client" />

// CAD files are imported as ArrayBuffers (vite-plugins/cad-files.ts), with or without ?raw / ?buffer.
declare module '*.ofb' {
  const buffer: ArrayBuffer
  export default buffer
}
declare module '*.stp' {
  const buffer: ArrayBuffer
  export default buffer
}
declare module '*.step' {
  const buffer: ArrayBuffer
  export default buffer
}
declare module '*?buffer' {
  const buffer: ArrayBuffer
  export default buffer
}

// How ClassCAD is reached, set when the app is built (vite.config.ts, from .env).
declare const CLASSCAD_WASM_KEY: string
declare const SOCKETIO_URL: string
