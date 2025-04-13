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
      '/socket.io': {
        target: 'https://localhost:3000', // URL de votre backend
        ws: true, // Active la prise en charge des WebSockets
        changeOrigin: true,
        secure: false, // Ignore la validation du certificat auto-signé
        configure: (proxy, options) => {
          proxy.on('proxyReqWs', (proxyReq: any, req: any, socket: any, head: any) => {
            console.log('Proxying WebSocket request:', req.url);
          });
          proxy.on('proxyRes', (proxyRes: any) => {
            console.log('Received response from target:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('WebSocket proxy error:', err);
          });
          proxy.on('open', () => {
            console.log('WebSocket connection established');
          });
          proxy.on('close', () => {
            console.log('WebSocket connection closed');
          });
        }
      },
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
              console.log('Response chunk:');
              const data = JSON.parse(chunk.toString());
              console.log(JSON.stringify(data, null, 2));
            });
          });
        },
      },
    },
  },
})