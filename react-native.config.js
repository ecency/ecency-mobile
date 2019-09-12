module.exports = {
  dependencies: {
    realm: {
      platforms: {
        ios: null, // disable iOS platform, other platforms will still autolink if provided
      },
    },
    'react-native-config': {
      platforms: {
        ios: null,
      },
    },
  },
  assets: ['react-native-vector-icons'],
};
