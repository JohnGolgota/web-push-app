import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())
  const outDir = `${env.VITE_OUT_DIR ?? "dist"}`
  return {
  plugins: [vue()],
  build: {
    outDir,
    manifest: true,
    emptyOutDir: true
  }
}})
