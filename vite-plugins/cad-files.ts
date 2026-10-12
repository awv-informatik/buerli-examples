import fs from 'node:fs'
import type { Plugin } from 'vite'

/**
 * CAD files (.ofb, .stp, ...) are imported as ArrayBuffers, with or without `?raw` / `?buffer`:
 * the engine reads them as binary.
 */
export default function cadFiles(): Plugin {
  const cad = /\.(ofb|of1|stp|step|iwp)(\?(raw|buffer))?$/i
  return {
    name: 'cad-files',
    enforce: 'pre',
    load(id) {
      if (!cad.test(id)) return
      const base64 = fs.readFileSync(id.replace(/\?.*$/, '')).toString('base64')
      return `const s = atob(${JSON.stringify(base64)})
const bytes = new Uint8Array(s.length)
for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i)
export default bytes.buffer`
    },
  }
}
