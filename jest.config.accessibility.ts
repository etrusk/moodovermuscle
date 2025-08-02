import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const accessibilityJestConfig: Config = {
  displayName: 'accessibility',
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/msw-setup.js',
    '<rootDir>/__tests__/setup/accessibility-utils.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw|@mswjs)/)'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}

export default createJestConfig(accessibilityJestConfig)