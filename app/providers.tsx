
"use client"

import React, { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { ThemeProvider } from '@/components/theme-provider'
import ClientErrorBoundary from '@/components/client-error-boundary'
import { config } from "../components/WalletConnect"
import ChunkErrorRecovery from '@/components/client-chunk-error-recovery'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function EnvironmentValidator() {
  useEffect(() => {
    // Only run client-side after hydration
    if (typeof window === 'undefined') return

    const requiredVars = [
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS,
      process.env.NEXT_PUBLIC_NETWORK
    ]

    const missing = requiredVars.filter(value => {
      return !value || value === '' || value === 'undefined' || value === 'your_project_id_here'
    })

    if (missing.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('[v0] Missing critical environment variables:', missing.length, 'variables')
    } else {
      console.log('[v0] ✅ All environment variables loaded successfully')
    }
  }, [])

  return null
}

function ProvidersComponent({
  children,
}: {
  children: React.ReactNode
}) {
  // Validate config availability
  const validConfig = typeof window !== 'undefined' ? config : null

  if (typeof window !== 'undefined' && !validConfig) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="p-4 text-red-600">Error: Wallet configuration not available</div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={validConfig || config}>
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

export default ProvidersComponent
export { ProvidersComponent as Providers }
