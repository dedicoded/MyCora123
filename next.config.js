const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true" && process.env.NODE_ENV !== "production",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['fs'],
  },
  env: {
    WEB3_STORAGE_TOKEN: process.env.WEB3_STORAGE_TOKEN,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }

      config.externals = config.externals || {}
      config.externals = {
        ...config.externals,
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      }

      // Ignore Node.js modules in client bundle
      config.plugins = config.plugins || []
      config.plugins.push(
        new (require('webpack')).IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/
        })
      )

      // Production optimizations
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          cacheUnaffected: true,
          splitChunks: {
            chunks: 'all',
            maxSize: 244000,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
              web3: {
                test: /[\\/]node_modules[\\/](wagmi|viem|@rainbow-me|@walletconnect)[\\/]/,
                name: 'web3',
                chunks: 'all',
              },
            },
          },
        }
      }
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)