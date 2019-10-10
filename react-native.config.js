module.exports = {
  dependencies: {
    realm: {
      platforms: {
        ios: null, // disable iOS platform, other platforms will still autolink if provided
      },
    },
    'react-native-code-push': {
      platforms: {
        android: null, // disable Android platform, other platforms will still autolink if provided
      },
    },
  },
  assets: ['react-native-vector-icons'],
};
