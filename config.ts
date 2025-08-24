const config = {
  transformer: {
    getTransformOptions: () => ({
      transform: { inlineRequires: true },
    }),
  },
};

export default config;
