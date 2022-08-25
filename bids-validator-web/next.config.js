// next.config.js
const withTM = require('next-transpile-modules')

module.exports = withTM({
  transpileModules: ['bids-validator'],
  assetPrefix: './',
  webpack5: false,
  webpack: (config, {}) => {
    config.resolve.symlinks = false
    return config
  },
})
