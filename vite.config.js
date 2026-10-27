import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // /api로 시작하는 요청을 ASP.NET Core 백엔드(5112)로 그대로 전달.
      // -> 프론트/백엔드가 서로 다른 포트(다른 origin)라 CORS 없이 상대경로(fetch('/api/...'))로 호출하면 편하잖아. 그래서 걍 바로 프록시 걺.
      '/api': {
        target: 'http://localhost:5112',
        changeOrigin: true,
      },
      // SignalR Hub(/hubs/dashboard)도 같은 백엔드로 프록시. ws:true 필요 -> 웹소켓 업그레이드까지 그대로 전달.
      '/hubs': {
        target: 'http://localhost:5112',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
