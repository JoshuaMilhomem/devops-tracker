import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// 🟢 Importar

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'DevOps Tracker',
        short_name: 'DOTracker',
        description: 'Rastreamento de tempo e tarefas para engenheiros.',
        theme_color: '#0f172a', // Cor do Slate 950
        background_color: '#0f172a',
        display: 'standalone', // Isso remove a barra do navegador!
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png', // Vamos gerar este ícone dummy abaixo
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
