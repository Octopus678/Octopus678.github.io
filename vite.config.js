import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 监听 0.0.0.0，允许同一网络下的手机/电脑访问
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
