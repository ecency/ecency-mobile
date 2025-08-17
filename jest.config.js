module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // Ensure modules with modern syntax such as @sentry/react-native are transformed
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@sentry/react-native)/',
  ],
};
