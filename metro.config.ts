import { getDefaultConfig, mergeConfig } from '@react-native/metro-config';
import { wrapWithReanimatedMetroConfig } from 'react-native-reanimated/metro-config';
import { withSentryConfig } from '@sentry/react-native/metro';

const config = {};

export default wrapWithReanimatedMetroConfig(
  withSentryConfig(mergeConfig(getDefaultConfig(__dirname), config)),
);
