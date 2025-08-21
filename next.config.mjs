import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true" && process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Removed invalid allowedDevOrigins
  },

  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          }
        ]
      }
    ]
  },

  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/@thirdweb-dev/**",
      "./lib/**"
    ]
  },
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
  // Replit optimized configuration
  serverRuntimeConfig: {
    PROJECT_ROOT: process.cwd()
  },
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  // Replit-specific settings
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.REPLIT_APP_URL : '',
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Cache control headers combined with COOP headers above

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

      // Add ignore plugin synchronously
      if (typeof config.plugins === 'undefined') {
        config.plugins = []
      }

      // Production optimizations with chunk error resilience
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            maxSize: 180000, // Reduced to prevent timeout errors
            minSize: 15000,
            maxAsyncRequests: 20,
            maxInitialRequests: 10,
            cacheGroups: {
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: -10,
                chunks: 'all',
                enforce: true,
              },
              web3: {
                test: /[\\/]node_modules[\\/](wagmi|viem|@rainbow-me|@walletconnect)[\\/]/,
                name: 'web3',
                priority: 10,
                chunks: 'all',
                enforce: true,
              },
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                priority: 20,
                chunks: 'all',
                enforce: true,
              },
            },
          },
          // Add runtime chunk optimization with better error handling
          runtimeChunk: {
            name: 'runtime',
          },
        }
      }

      // Add chunk loading timeout configuration
      config.output = {
        ...config.output,
        chunkLoadTimeout: 30000, // 30 seconds instead of default 120
        crossOriginLoading: 'anonymous',
      }
    }

    return config
  },
}

export default bundleAnalyzer(nextConfig);