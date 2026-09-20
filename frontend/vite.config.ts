import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = process.env.BACKEND_URL ?? env.BACKEND_URL ?? 'http://localhost:5001';
  const proxy = {
    '/api/table-sessions/': {
      target: backendUrl,
      changeOrigin: true,
      timeout: 10000,
      proxyTimeout: 10000,
    },
  };

  return {
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    css: { postcss: { plugins: [tailwindcss()] } },
    server: {
      host: 'localhost', port: 5173, strictPort: true, proxy,
      watch: process.env.CODEX_SANDBOX === 'seatbelt' ? { useFsEvents: false, usePolling: true } : undefined,
    },
    preview: { host: 'localhost', port: 5173, strictPort: true, proxy },
  };
});
