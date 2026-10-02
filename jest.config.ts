import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!jest.config.ts',
    '!jest.setup.ts',
    '!**/index.ts', // Exclude barrel export files
    '!app/page.tsx', // Exclude server components
    '!app/layout.tsx', // Exclude layout
    '!app/**/route.ts', // Exclude API routes
    '!app/api/**', // Exclude all API directory
    '!**/data.json', // Exclude data files
    '!next.config.ts', // Exclude Next config
    '!tailwind.config.ts', // Exclude Tailwind config
    '!postcss.config.mjs', // Exclude PostCSS config
  ],
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
