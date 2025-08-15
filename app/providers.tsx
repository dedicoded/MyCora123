"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string | null
  connect: () => Promise<void>
  disconnect: () => void
  chainId: number
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useAccount() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useAccount must be used within Providers")
  return {
    address: context.address,
    isConnected: context.isConnected,
    chainId: context.chainId,
  }
}

export function useBalance() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useBalance must be used within Providers")
  return {
    data: context.balance ? { formatted: context.balance, symbol: "ETH" } : null,
  }
}

export function useConnect() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useConnect must be used within Providers")
  return {
    connect: context.connect,
  }
}

export function useDisconnect() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useDisconnect must be used within Providers")
  return {
    disconnect: context.disconnect,
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId] = useState(1) // Ethereum mainnet

  const connect = useCallback(async () => {
    // Mock wallet connection for preview
    const mockAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
    const mockBalance = "1.234"

    setAddress(mockAddress)
    setBalance(mockBalance)
    setIsConnected(true)
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setBalance(null)
    setIsConnected(false)
  }, [])

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
    chainId,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
