module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */
  config.performance = {
    maxAssetSize: 1500000,
    maxEntrypointSize: 1500000
  };
  return config;
}
