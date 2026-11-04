const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro bundler configuration.
 *
 * `whisper.rn` imports `Buffer` from `safe-buffer`, which does
 * `require('buffer')` (the Node core module). The React Native runtime has no
 * Node stdlib, so Metro hard-fails the Android bundle with:
 *
 *   "The package at node_modules/safe-buffer/index.js attempted to import
 *    the Node standard library module buffer"
 *
 * Fix: alias both `buffer` and `safe-buffer` to the pure-JS `buffer` polyfill
 * (Feross). whisper.rn only uses `Buffer.from(x, 'base64')`, which the
 * polyfill supports, so the alias is behavior-preserving.
 *
 * Requires: `npm install buffer` (pure JS: buffer + base64-js + ieee754).
 */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  buffer: require.resolve('buffer'),
  'safe-buffer': require.resolve('buffer'),
};

module.exports = config;
