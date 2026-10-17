import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import checker from 'vite-plugin-checker'
import cadFiles from './vite-plugins/cad-files'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // How ClassCAD is reached is set in .env.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.CLASSCAD_PUBLIC_TOKEN?.startsWith('ccsk_')) {
    throw new Error(
      'CLASSCAD_PUBLIC_TOKEN is a secret access token (ccsk_…). A page takes a public one (ccpk_…); the secret token stays with a native engine.',
    )
  }
  return {
    define: {
      CLASSCAD_PUBLIC_TOKEN: JSON.stringify(env.CLASSCAD_PUBLIC_TOKEN ?? ''),
      WS_URL: JSON.stringify(env.WS_URL ?? ''),
      SOCKETIO_URL: JSON.stringify(env.SOCKETIO_URL ?? ''),
    },
    build: { outDir: './build' },
    plugins: [cadFiles(), react(), checker({ overlay: { initialIsOpen: false }, typescript: true })],
  }
})
