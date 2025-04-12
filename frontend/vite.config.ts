import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync('https.key', 'utf8'),
      cert: fs.readFileSync('https.crt', 'utf8'),

    },
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        changeOrigin: true, // Change the origin of the host header to the target URL
        secure: false, // Ignore self-signed certificate validation
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying request:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response from target:', proxyRes.statusCode);
            proxyRes.on('data', (chunk) => {
              console.log('Response chunk:', chunk.toString());
            });
          });
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
        },
      },
    },
  },
})