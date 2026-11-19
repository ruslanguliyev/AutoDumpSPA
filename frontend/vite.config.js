import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const utf8HeaderPlugin = () => ({
  name: 'utf8-content-type-header',
  configureServer(server) {
    server.middlewares.use((_, res, next) => {
      const originalSetHeader = res.setHeader.bind(res)
      res.setHeader = (name, value) => {
        if (
          typeof name === 'string' &&
          name.toLowerCase() === 'content-type' &&
          typeof value === 'string' &&
          value.startsWith('text/html') &&
          !/charset=/i.test(value)
        ) {
          return originalSetHeader(name, `${value}; charset=utf-8`)
        }
        return originalSetHeader(name, value)
      }
      next()
    })
  },
})

// Splits the entry bundle: translations load per language, and the framework
// libraries get their own long-lived chunks instead of riding in index-*.js.
const manualChunks = (id) => {
  const locale = id.match(/\/src\/i18n\/locales\/(az|ru|en)\//);
  if (locale) return `locale-${locale[1]}`;

  if (!id.includes('/node_modules/')) return undefined;
  if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react';
  if (/\/node_modules\/(react-router|react-router-dom)\//.test(id)) return 'vendor-router';
  if (/\/node_modules\/@tanstack\/(react-)?query/.test(id)) return 'vendor-query';
  if (/\/node_modules\/(i18next|react-i18next)\//.test(id)) return 'vendor-i18n';
  return undefined;
};

export default defineConfig({
  plugins: [utf8HeaderPlugin(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: { manualChunks },
    },
  },
  server: {
    host: true,
    // Mirrors nginx.conf: the browser talks to this origin and Vite forwards API
    // traffic to the backend, so no CORS setup is needed in development.
    // Set VITE_API_URL=/graphql in .env to use it.
    proxy: {
      '/graphql': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
    // Prevent duplicate React instances if node_modules exist higher up the filesystem.
    dedupe: ['react', 'react-dom'],
  },
})
