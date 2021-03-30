// next.config.js
const withScss = require('@zeit/next-sass')
const withCss = require('@zeit/next-css')
const withTM = require('next-transpile-modules')

module.exports = withTM( withCss( withScss({
  transpileModules: ['bids-validator'],
  assetPrefix: './',
  webpack: (config, {}) => {
    config.resolve.symlinks = false
    return config
  },
})))
