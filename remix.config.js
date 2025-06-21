module.exports = {
  future: {
    v3_routeConvention: true,
  },
  serverBuildTarget: 'vercel',
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ['.*'],
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverDependenciesToBundle: 'all',
};
