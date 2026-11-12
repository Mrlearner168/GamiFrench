/**
 * Babel configuration.
 *
 * `babel-preset-expo` is what Expo uses when no config file exists (it also
 * wires up the Reanimated / Worklets plugin), so development behaves exactly
 * as before. The only addition: production bundles drop console.log / info /
 * debug calls (about 190 of them, some stringifying the whole progress state
 * on hot paths). `console.warn` and `console.error` are kept.
 */
module.exports = function babelConfig(api) {
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]],
      },
    },
  };
};
