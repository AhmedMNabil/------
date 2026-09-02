import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backendTarget = env.VITE_BACKEND_URL || 'http://63.184.29.99:7000';
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/ask': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          // A deep-agent run streams nothing back until it is done, so these are
          // idle timeouts against a socket that is silent for the whole run.
          // At 60s the proxy killed the socket mid-run and the browser silently
          // replayed the POST, which is what the backend saw as a duplicate.
          timeout: 900000,
          proxyTimeout: 900000,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/video/': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000,
        },
        '/delete_video/': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 300000,
          proxyTimeout: 300000,
        },
        '/health': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
