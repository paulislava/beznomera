/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    outputStandalone: true
  },
  swcMinify: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    return config
  },
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300
    }
    return config
  },
  eslint: {}
}

module.exports = nextConfig
