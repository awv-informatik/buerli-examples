import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import checker from 'vite-plugin-checker'
import cadFiles from './vite-plugins/cad-files'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // How ClassCAD is reached is set in .env.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      CLASSCAD_WASM_KEY: JSON.stringify(env.CLASSCAD_WASM_KEY ?? ''),
      SOCKETIO_URL: JSON.stringify(env.SOCKETIO_URL ?? ''),
    },
    build: { outDir: './build' },
    plugins: [cadFiles(), react(), checker({ overlay: { initialIsOpen: false }, typescript: true })],
  }
})
