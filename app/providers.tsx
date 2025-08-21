"use client"

import React, { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { ThemeProvider } from '@/components/theme-provider'
import { ClientErrorBoundary } from '@/components/client-error-boundary'
import { config } from "../components/WalletConnect"
import { ChunkErrorRecovery } from '@/components/client-chunk-error-recovery'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Ensure config is available before using it
const validateConfig = () => {
  if (typeof window === 'undefined') return null // Server-side
  return config // Client-side
}

function EnvironmentValidator() {
  useEffect(() => {
    // Only run client-side after hydration and ensure we're in development
    if (typeof window === 'undefined') return

    const required = [
      'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
      'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS',
      'NEXT_PUBLIC_NETWORK'
    ]

    const envValues = {
      walletConnect: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'FOUND' : 'MISSING',
      contract: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS ? 'FOUND' : 'MISSING',
      network: process.env.NEXT_PUBLIC_NETWORK ? 'FOUND' : 'MISSING'
    }

    const missing = required.filter(key => {
      const value = process.env[key]
      return !value || value === '' || value === 'undefined' || value === 'your_project_id_here'
    })

    console.log('[v0] Actual env values:', envValues)
    
    if (missing.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('[v0] Missing critical environment variables:', missing)
    } else {
      console.log('[v0] ✅ All environment variables loaded successfully')
    }
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div>Loading wallet configuration...</div>
      </ThemeProvider>
    )
  }

  const validConfig = validateConfig()

  if (!validConfig) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div>Error: Wallet configuration not available</div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={validConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ClientErrorBoundary>
              <EnvironmentValidator />
              {children}
              <ChunkErrorRecovery />
            </ClientErrorBoundary>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}