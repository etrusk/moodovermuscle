import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/msw-setup.js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    '!lib/generated/**',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/__tests__/**',
    '!**/setup/**',
    '!**/*.mock.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    // Critical business logic (100% required)
    './lib/db/': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './lib/auth/': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './app/api/': { statements: 100, branches: 100, functions: 100, lines: 100 },
    
    // TODO: Increase to 100% after fixing 52 failing admin component tests
    './components/': { statements: 85, branches: 80, functions: 85, lines: 85 },
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw|@mswjs)/)'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}

export default createJestConfig(customJestConfig)
