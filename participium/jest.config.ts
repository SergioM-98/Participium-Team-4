/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
  // Configurazione per progetti multipli
  projects: [
    {
      // Progetto per Unit Tests
      displayName: "Unit Tests",
      testMatch: ["<rootDir>/test/unit/**/*.test.ts"],
      testEnvironment: "jest-environment-node",
      clearMocks: true,
      preset: "ts-jest",
      moduleNameMapper: {
        "^@/repositories/(.*)$": "<rootDir>/src/app/lib/repositories/$1",
        "^@/dtos/(.*)$": "<rootDir>/src/app/lib/dtos/$1",
        "^@/services/(.*)$": "<rootDir>/src/app/lib/services/$1",
        "^@/controllers/(.*)$": "<rootDir>/src/app/lib/controllers/$1",
        "^@/utils/(.*)$": "<rootDir>/src/app/lib/utils/$1",
        "^@/prisma/(.*)$": "<rootDir>/prisma/$1",
        "^@/db/(.*)$": "<rootDir>/prisma/$1",
        "^@/lib/(.*)$": "<rootDir>/src/app/lib/$1",
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            useESM: true,
          },
        ],
      },
      extensionsToTreatAsEsm: [".ts", ".tsx"],
      globals: {
        "ts-jest": {
          useESM: true,
        },
      },
    },
    {
      // Progetto per Integration Tests
      displayName: "Integration Tests",
      testMatch: ["<rootDir>/test/integrated/**/*.test.ts"],
      testEnvironment: "jest-environment-node",
      clearMocks: true,
      preset: "ts-jest",
      setupFiles: ["<rootDir>/jest.setup.js"],
      setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
      moduleNameMapper: {
        "^@/repositories/(.*)$": "<rootDir>/src/app/lib/repositories/$1",
        "^@/dtos/(.*)$": "<rootDir>/src/app/lib/dtos/$1",
        "^@/services/(.*)$": "<rootDir>/src/app/lib/services/$1",
        "^@/controllers/(.*)$": "<rootDir>/src/app/lib/controllers/$1",
        "^@/utils/(.*)$": "<rootDir>/src/app/lib/utils/$1",
        "^@/prisma/(.*)$": "<rootDir>/prisma/$1",
        "^@/db/(.*)$": "<rootDir>/prisma/$1",
        "^@/lib/(.*)$": "<rootDir>/src/app/lib/$1",
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            useESM: true,
          },
        ],
      },
      extensionsToTreatAsEsm: [".ts", ".tsx"],
      globals: {
        "ts-jest": {
          useESM: true,
        },
      },
    },
  ],

  // Configurazione globale per coverage
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",

  // Escludi cartelle che non devono essere testate
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/test/",
    "/src/app/api/auth/", // NextAuth implementation - library code
    '/src/app/lib/services/photoRetrieval.service.ts',
    '/src/app/lib/services/photoStatus.service.ts',
    '/src/app/lib/services/photoUpdate.service.ts',
    '/src/app/lib/services/photoDelete.service.ts',
  ],

  // Escludi dai test paths
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/app/api/auth/",
  ],

  // Escludi dalla collezione coverage
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/app/api/auth/**",
    "!src/app/api/telegram/**", // Escludi API routes Telegram
    "!src/components/ui/**",
    "!src/components/**", // Escludi tutti i componenti UI/React
    "!src/app/lib/dtos/**",
    "!src/app/lib/hooks/**", // Escludi hooks React
    "!src/types/**",
    "!src/**/*.d.ts",
    "!src/app/**/*.css",
    "!src/app/**/*.tsx", // Escludi tutti i file TSX (pagine e componenti)
    "!src/app/**/page.tsx", // Escludi tutte le pagine Next.js
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/error.tsx",
    "!src/app/**/not-found.tsx",
    "!src/app/forbidden.tsx",
    "!src/app/providers.tsx",
    "!src/middleware.ts",
    "!src/auth.ts", // Escludi configurazione NextAuth
    "!src/app/lib/init.ts", // File di inizializzazione
    "!src/app/lib/utils/index.ts", // Re-export utils
    "!src/app/lib/utils/canvasUtils.ts", // Utility canvas (UI)
    "!src/lib/**", // Utility generiche
    '!src/app/lib/services/photoRetrieval.service.ts',
    '!src/app/lib/services/photoStatus.service.ts',
    '!src/app/lib/services/photoUpdate.service.ts',
    '!src/app/lib/services/photoDelete.service.ts',
    '!src/app/lib/repositories/telegramBot.repository.ts',
  ],

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
    "node",
  ],

  // Trasformazioni ignorate
  transformIgnorePatterns: ["\\\\node_modules\\\\", "\\.pnp\\.[^\\\\]+$"],
};

export default config;
