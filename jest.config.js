/**
 * Jest configuration for the offline-first unit tests.
 *
 * `preset: 'jest-expo'` supplies the babel transform for RN/Expo JSX + TS, and
 * the moduleNameMapper mirrors the `@/*` -> `src/*` path alias from tsconfig so
 * the same import specifiers used in the app resolve inside tests.
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^safe-buffer$': '<rootDir>/node_modules/buffer/index.js',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
