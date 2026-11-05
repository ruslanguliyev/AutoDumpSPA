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

export default defineConfig({
  plugins: [utf8HeaderPlugin(), react(), tailwindcss()],
  server: {
    host: true,
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
