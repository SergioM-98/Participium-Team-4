/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  // Configurazione per progetti multipli
  projects: [
    {
      // Progetto per Unit Tests
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
      testEnvironment: 'jest-environment-node',
      clearMocks: true,
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@/repositories/(.*)$': '<rootDir>/src/app/lib/repositories/$1',
        '^@/dtos/(.*)$': '<rootDir>/src/app/lib/dtos/$1',
        '^@/services/(.*)$': '<rootDir>/src/app/lib/services/$1',
        '^@/controllers/(.*)$': '<rootDir>/src/app/lib/controllers/$1',
        '^@/prisma/(.*)$': '<rootDir>/prisma/$1',
        '^@/db/(.*)$': '<rootDir>/prisma/$1',
        '^@/lib/(.*)$': '<rootDir>/src/app/lib/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: true,
        }],
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      globals: {
        'ts-jest': {
          useESM: true,
        },
      },
    },
    {
      // Progetto per Integration Tests
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/test/integrated/**/*.test.ts'],
      testEnvironment: 'jest-environment-node',
      clearMocks: true,
      preset: 'ts-jest',
      setupFiles: ['<rootDir>/jest.setup.js'],
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      moduleNameMapper: {
        '^@/repositories/(.*)$': '<rootDir>/src/app/lib/repositories/$1',
        '^@/dtos/(.*)$': '<rootDir>/src/app/lib/dtos/$1',
        '^@/services/(.*)$': '<rootDir>/src/app/lib/services/$1',
        '^@/controllers/(.*)$': '<rootDir>/src/app/lib/controllers/$1',
        '^@/prisma/(.*)$': '<rootDir>/prisma/$1',
        '^@/db/(.*)$': '<rootDir>/prisma/$1',
        '^@/lib/(.*)$': '<rootDir>/src/app/lib/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: true,
        }],
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      globals: {
        'ts-jest': {
          useESM: true,
        },
      },
    }
  ],

  // Configurazione globale per coverage
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",

  // Estensioni dei moduli
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

  // Trasformazioni ignorate
  transformIgnorePatterns: [
    "\\\\node_modules\\\\",
    "\\.pnp\\.[^\\\\]+$"
  ],
};

export default config;
