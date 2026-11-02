import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/appweb_regalos_sarai/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 8443,
  }
})
