import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './vitest.setup.ts',
      './__tests__/setup/msw-setup.js',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/api/**/*.{ts,tsx}',
      ],
      exclude: [
        'lib/generated/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/__tests__/**',
        '**/setup/**',
        '**/*.mock.{ts,tsx}',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/e2e/**',
    ],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})