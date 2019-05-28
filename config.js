const config = {
  transformer: {
    getTransformOptions: () => ({
      transform: { inlineRequires: true },
    }),
  },
};

module.exports = config;
