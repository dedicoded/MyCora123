"use client"

import React from "react"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import "@rainbow-me/rainbowkit/styles.css"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn("[v0] WalletConnect Project ID not found. Wallet functionality will be limited.")
}

const config = getDefaultConfig({
  appName: "MyCora",
  projectId: projectId || "demo-project-id", // Use demo ID if not configured
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
  // Add storage configuration to handle SSR
  storage: typeof window !== 'undefined' ? 
    () => window.localStorage : 
    () => ({ getItem: () => null, setItem: () => {}, removeItem: () => {} }),
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries to prevent excessive error logging
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
