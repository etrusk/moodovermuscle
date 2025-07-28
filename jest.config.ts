import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default async () => {
  const jestConfig = await createJestConfig(customJestConfig)();
  
  // Custom transformIgnorePatterns
  jestConfig.transformIgnorePatterns = [
    '/node_modules/(?!msw)',
  ];

  return jestConfig;
};