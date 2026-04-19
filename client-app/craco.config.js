module.exports = {
  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    },
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    }
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        /DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE/,
        /DEP_WEBPACK_DEV_SERVER_ON_BEFORE_SETUP_MIDDLEWARE/
      ];
      return webpackConfig;
    }
  }
};