/** @type {import('jest').Config} */
module.exports = {
  displayName: 'AI Sidebar Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/components/AISidebar/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/components/AISidebar/__tests__/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/components/AISidebar/**/*.{ts,tsx}',
    '!src/components/AISidebar/**/*.d.ts',
    '!src/components/AISidebar/**/*.stories.{ts,tsx}',
    '!src/components/AISidebar/**/index.{ts,tsx}',
  ],
  coverageDirectory: '<rootDir>/coverage/ai-sidebar',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
};
