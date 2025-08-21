import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.ts'],
  // Ensure modules with modern syntax such as @sentry/react-native are transformed
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@sentry/react-native)/',
  ],
};

export default config;
