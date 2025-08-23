/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1c711c0584ef1a9b8f4e34aa99c21658',
    NEXT_PUBLIC_MCC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS || '0x6C7Bb1ABF40C62cEbF95a8c57E24F0b8d7a88888',
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
    PROJECT_ID: process.env.PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1c711c0584ef1a9b8f4e34aa99c21658'
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', 'react-icons', '@rainbow-me/rainbowkit', 'wagmi', '@tanstack/react-query', 'framer-motion', 'lucide-react'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
        ],
      },
    ];
  },

  // Replit compatibility
  allowedDevOrigins: [
    'localhost:5000',
    '127.0.0.1:5000',
    '*.replit.dev',
    '*.worf.replit.dev'
  ],

  // Essential settings for your Web3 app
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['placeholder.pics']
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },

  transpilePackages: ['magic-sdk']
};

export default nextConfig;