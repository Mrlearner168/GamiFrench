// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      ".expo/*",
      ".expo-export-check/*",
      "android/*",
      "node_modules/*",
    ],
  },
  {
    // Unit tests run under Jest, so the Jest globals must be known here.
    // Without this every `describe`/`it`/`expect` in __tests__ is no-undef.
    files: ["**/__tests__/**/*.test.[jt]s?(x)", "**/*.test.[jt]s?(x)"],
    languageOptions: {
      globals: {
        jest: "readonly",
        Buffer: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
      },
    },
  },
]);
