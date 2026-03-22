import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Chain — Habit Tracker',
        short_name: 'Chain',
        description: "Build habits. Don't break the chain.",
        theme_color: '#0a0a12',
        background_color: '#0a0a12',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/chain/',
        start_url: '/chain/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        navigateFallback: '/chain/index.html',
        navigateFallbackDenylist: [/^\/chain\/assets\//],
      },
    }),
  ],
  base: '/chain/',
  server: {
    port: 5173,
  },
})
