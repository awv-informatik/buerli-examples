/// <reference types="vite/client" />

declare module '*.ofb'
declare module '*.stp'
declare module '*.step'
declare module '*.ts'
declare module '*.tsx'

declare module '*?buffer' {
  const buffer: ArrayBuffer
  export default buffer
}

// Dirty workaround
declare const require: any
