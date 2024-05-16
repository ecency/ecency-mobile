module.exports = (api) => {
  const babelEnv = api.env();
  const plugins = [];
  // change to 'production' to check if this is working in 'development' mode
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }

  // Reanimated should be last plugin added in babel
  plugins.push(['react-native-reanimated/plugin']);
  return {
    presets: ['module:@react-native/babel-preset'],
    sourceMaps: true,
    plugins,
  };
};
