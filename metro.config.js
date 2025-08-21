// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/react-native/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

// eslint-disable-next-line max-len
module.exports = wrapWithReanimatedMetroConfig(
  withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config)),
);
