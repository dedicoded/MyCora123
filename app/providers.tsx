'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { sepolia, polygon } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { ChunkErrorRecoveryWrapper } from '../components/ChunkErrorRecoveryWrapper'
import { ClientErrorBoundary } from '../components/client-error-boundary'
import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

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

// Dynamic wrapper to prevent hydration issues with WalletConnect
const WalletProviderWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading wallet...</div>
      </div>
    )
  }
)

function HydrationBoundary({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Initializing...</div>
      </div>
    }>
      <WalletProviderWrapper>
        <ClientErrorBoundary>
          <ChunkErrorRecoveryWrapper>
            {children}
          </ChunkErrorRecoveryWrapper>
        </ClientErrorBoundary>
      </WalletProviderWrapper>
    </Suspense>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
    >
      <HydrationBoundary>
        {children}
      </HydrationBoundary>
    </ThemeProvider>
  )
}