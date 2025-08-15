import commonjs from '@rollup/plugin-commonjs'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), commonjs()],
    build: {
      rollupOptions: {
        external: ['sequelize']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {}
})
