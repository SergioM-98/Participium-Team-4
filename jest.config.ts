/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "jest-environment-node",

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "mts",
    "cts",
    "tsx",
    "json",
    "node"
  ],

  // A map from regular expressions to module names - AGGIUNTO I PATH MAPPINGS
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/services/(.*)$': '<rootDir>/src/app/lib/services/$1',
    '^@/controllers/(.*)$': '<rootDir>/src/app/lib/controllers/$1',
    '^@/repositories/(.*)$': '<rootDir>/src/app/lib/repositories/$1',
    '^@/dtos/(.*)$': '<rootDir>/src/app/lib/dtos/$1',
    '^@/models/(.*)$': '<rootDir>/src/app/lib/models/$1',
    '^@/utils/(.*)$': '<rootDir>/src/app/lib/utils/$1',
    '^@/middlewares/(.*)$': '<rootDir>/src/app/lib/middlewares/$1',
    '^@/types/(.*)$': '<rootDir>/src/app/lib/types/$1',
    '^@/lib/(.*)$': '<rootDir>/src/app/lib/$1',
    '^@/db/(.*)$': '<rootDir>/prisma/$1',
  },

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  ],

  // A map from regular expressions to paths to transformers - AGGIUNTO SUPPORTO TYPESCRIPT
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
    }],
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    "\\\\node_modules\\\\",
    "\\.pnp\\.[^\\\\]+$"
  ],

  // AGGIUNTO: Setup files per configurazioni globali (opzionale)
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // AGGIUNTO: Preset per TypeScript (alternativa a transform)
  preset: 'ts-jest',

  // AGGIUNTO: Configurazioni per ESModules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};

export default config;
