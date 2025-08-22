'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { sepolia, polygon } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '../components/theme-provider'
import ChunkErrorRecoveryWrapper from '../components/ChunkErrorRecoveryWrapper'
import ClientErrorBoundary from '../components/client-error-boundary'
import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Config } from 'wagmi'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Create a stable config that won't change during hydration
const getStableConfig = () => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fallback-project-id'
  return getDefaultConfig({
    appName: 'MyCora',
    projectId,
    chains: [sepolia, polygon],
    ssr: true,
  })
}

const config = getStableConfig()

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [validConfig, setValidConfig] = useState<Config | null>(null)

  useEffect(() => {
    setMounted(true)
    // Prevent setState during render
    const timer = setTimeout(() => {
      if (config) {
        setValidConfig(config)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WagmiProvider config={validConfig || config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()} coolMode>
            <ClientErrorBoundary>
              <ChunkErrorRecoveryWrapper>
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
                    <div className="text-center">
                      <div className="animate-pulse text-green-400 text-xl mb-4">🌱 Growing your MyCora network...</div>
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto"></div>
                    </div>
                  </div>
                }>
                  {children}
                </Suspense>
              </ChunkErrorRecoveryWrapper>
            </ClientErrorBoundary>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}