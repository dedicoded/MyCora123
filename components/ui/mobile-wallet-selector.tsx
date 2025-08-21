
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { MobileWalletDetector, supportedMobileWallets, type MobileWalletConfig } from '@/lib/mobile-wallet-utils'

interface MobileWalletSelectorProps {
  onWalletSelect: (wallet: MobileWalletConfig) => void
  wcUri?: string
}

export function MobileWalletSelector({ onWalletSelect, wcUri }: MobileWalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<MobileWalletConfig | null>(null)
  const isMobile = MobileWalletDetector.isMobile()

  if (!isMobile) {
    return null
  }

  const handleWalletSelect = (wallet: MobileWalletConfig) => {
    setSelectedWallet(wallet)
    onWalletSelect(wallet)
  }

  return (
    <Card className="w-full max-w-md border-[var(--color-moss)] bg-gradient-to-br from-[var(--color-earth)] to-black/20">
      <CardHeader>
        <CardTitle className="text-[var(--color-glow)] flex items-center gap-2">
          📱 Choose Your Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {supportedMobileWallets.map((wallet) => (
          <Button
            key={wallet.name}
            variant={selectedWallet?.name === wallet.name ? "default" : "outline"}
            className={`w-full justify-start gap-3 p-4 ${
              selectedWallet?.name === wallet.name 
                ? 'bg-[var(--color-moss)] border-[var(--color-glow)]' 
                : 'border-[var(--color-moss)]/50 hover:border-[var(--color-glow)]'
            }`}
            onClick={() => handleWalletSelect(wallet)}
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              🔗
            </div>
            <div className="text-left">
              <div className="font-medium text-[var(--color-glow)]">{wallet.name}</div>
              <div className="text-xs opacity-75">Tap to connect</div>
            </div>
          </Button>
        ))}
        
        <div className="pt-2 border-t border-[var(--color-moss)]/30">
          <p className="text-xs text-center text-[var(--color-glow)] opacity-75">
            Don't have a wallet? Download one above to get started
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
