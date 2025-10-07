import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@teable/grid-table-kanban': path.resolve(
        __dirname,
        '../packages/grid-table-kanban/src'
      ),
      'ts-key-enum': path.resolve(__dirname, 'src/shims/ts-key-enum.ts'),
      'ts-keycode-enum': path.resolve(__dirname, 'src/shims/ts-keycode-enum.ts'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@teable/grid-table-kanban', 'ts-key-enum', 'ts-keycode-enum'],
  },
  server: {
    fs: {
      allow: [
        // 允许引用 monorepo 包源码
        path.resolve(__dirname, '../packages/grid-table-kanban'),
        // 允许直接访问 demo 自身目录
        __dirname,
        path.resolve(__dirname, '..'),
      ],
    },
  },
})
