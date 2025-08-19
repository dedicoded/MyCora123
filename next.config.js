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
  webpack: (config, { isServer }) => {
    // Reduce bundle size by splitting chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      }
      // Disable usedExports to avoid conflicts with cacheUnaffected
      config.optimization.usedExports = false
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
