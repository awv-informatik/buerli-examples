/* eslint-disable @typescript-eslint/ban-ts-comment */
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import checker from 'vite-plugin-checker'
import dynamicImport from 'vite-plugin-dynamic-import'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import rawLoader from './vite-plugins/raw-loader'

// https://vitejs.dev/config/
export default () => {
  const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')

  return defineConfig({
    define: {
      'process.env.CLASSCADKEY': JSON.stringify(env.CLASSCADKEY ?? ''),
    },
    build: {
      outDir: './build',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    plugins: [
      rawLoader(),
      dynamicImport(),
      react(),
      checker({
        overlay: { initialIsOpen: false },
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
      viteTsconfigPaths(),
      svgrPlugin(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          math: 'always',
          relativeUrls: true,
          javascriptEnabled: true,
        },
      },
    },
  })
}
