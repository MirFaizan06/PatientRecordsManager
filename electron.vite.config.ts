import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'app/shared'),
        '@config': resolve(__dirname, 'config')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'app/main/main.ts'),
        output: {
          format: 'es',
          entryFileNames: 'main.js'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'app/shared')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'app/preload/preload.ts'),
        output: {
          format: 'cjs',
          entryFileNames: 'preload.cjs'
        }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'app/renderer'),
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'app/renderer/index.html')
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'app/renderer'),
        '@shared': resolve(__dirname, 'app/shared')
      }
    }
  }
})
