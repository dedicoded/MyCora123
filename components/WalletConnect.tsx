"use client"

import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useEffect, useState } from "react"
import { createConfig, http } from 'wagmi'

// Validate environment variables
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const network = process.env.NEXT_PUBLIC_NETWORK

if (!walletConnectProjectId) {
  console.warn("[WalletConnect] Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID")
  console.warn("[WalletConnect] Add your Project ID to Replit Secrets")
  console.warn("[WalletConnect] Get one at: https://cloud.reown.com/")
}

// Handle Replit dynamic URLs
const getAppInfo = () => {
  if (typeof window === 'undefined') {
    return {
      appName: "MyCora",
      appDescription: "Blockchain Trust Network",
      appUrl: "https://mycora.com",
      appIcon: "/placeholder-logo.svg"
    }
  }

  const isReplit = window.location.hostname.includes('replit.dev')
  const baseUrl = isReplit ? window.location.origin : "https://mycora.com"

  return {
    appName: "MyCora",
    appDescription: "Blockchain Trust Network",
    appUrl: baseUrl,
    appIcon: `${baseUrl}/placeholder-logo.svg`
  }
}

// Modern Reown AppKit configuration based on web examples
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo"

// Create the modal using Reown AppKit pattern from web examples
const modal = createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  networks: network === "mainnet" ? [mainnet] : [sepolia],
  metadata: {
    name: "MyCora",
    description: "Blockchain Trust Network",
    url: typeof window !== 'undefined' ? window.location.origin : "https://mycora.com",
    icons: ["/placeholder-logo.svg"]
  },
  allowUnsupportedChain: true
})

// Create a proper Wagmi config
export const config = createConfig({
  chains: network === "mainnet" ? [mainnet] : [sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false
})

export function WalletConnect() {
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState(null); // State for balance

  useEffect(() => {
    setMounted(true)
  }, [])

  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { open } = useAppKit()

  // Enhanced mobile detection and wallet connection
  const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)

  const handleWalletConnect = async () => {
    setIsConnecting(true)
    try {
      // Mobile-optimized connection flow
      if (isMobile) {
        // Deep link to wallet apps on mobile
        console.log('[WalletConnect] Mobile wallet connection initiated')
      }
    } catch (error) {
      console.error('[WalletConnect] Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Removed the redundant metadata definition here as it's defined above for getDefaultConfig.
  // If it was intended for connectorsForWallets, that part of the changes was not present in the original code's structure.


  if (!mounted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-2 border-[var(--color-moss)] bg-gradient-to-br from-[var(--color-earth)] to-black/20">
      <CardHeader>
        <CardTitle className="text-[var(--color-glow)] flex items-center gap-2">
          {isMobile ? "📱" : "💻"} Wallet Connection
          {isConnecting && <div className="animate-spin">🌀</div>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <button
            onClick={() => open()}
            className="w-full px-4 py-2 bg-[var(--color-moss)] text-white rounded-lg hover:bg-[var(--color-moss)]/80 transition-colors"
          >
            {isConnected ? 'Account' : 'Connect Wallet'}
          </button>
          {isMobile && !isConnected && (
            <p className="text-xs text-[var(--color-glow)] mt-2 opacity-75">
              Tap to connect your mobile wallet
            </p>
          )}
        </div>

        {isConnected && address && (
          <div className="space-y-2 p-3 rounded-lg bg-[var(--color-moss)]/20 border border-[var(--color-glow)]/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-[var(--color-glow)]">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
            {balance && (
              <p className="text-sm text-white/80">
                Balance: {balance.formatted} {balance.symbol}
              </p>
            )}
            {isMobile && (
              <p className="text-xs text-[var(--color-glow)] opacity-75">
                🔒 Secured by your mobile wallet
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}