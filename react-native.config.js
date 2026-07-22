module.exports = {
  dependencies: {
    // Android purchases run on expo-iap (Play Billing 9). react-native-iap 12 pins
    // Billing 7.0.0, which Play rejects for updates from Aug 31, 2026, so keep its
    // Android module out of the build entirely -- Play reads the classes shipped in
    // the AAB. iOS still links it, see src/providers/iap.
    'react-native-iap': {
      platforms: {
        android: null,
      },
    },
  },
  assets: ['react-native-vector-icons', './src/assets/fonts'],
};
