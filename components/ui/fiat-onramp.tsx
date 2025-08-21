"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganicCard, OrganicCardContent, OrganicCardHeader, OrganicCardTitle } from "@/components/ui/organic-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState, useEffect } from 'react'
import { magicWallet } from '@/lib/magic-wallet'

interface FiatOnRampProps {
  onPurchase?: (data: PurchaseData) => void
  className?: string
}

interface PurchaseData {
  amount: number
  paymentMethod: "credit_card" | "apple_pay" | "google_pay" | "bank_transfer"
  email: string
}

const paymentMethods = [
  { 
    id: "credit_card", 
    name: "Credit Card", 
    fee: 5, 
    icon: "💳",
    color: "from-blue-500 to-blue-600",
    description: "Visa, Mastercard, Amex"
  },
  { 
    id: "apple_pay", 
    name: "Apple Pay", 
    fee: 3, 
    icon: "🍎",
    color: "from-gray-800 to-black",
    description: "Touch ID or Face ID"
  },
  { 
    id: "google_pay", 
    name: "Google Pay", 
    fee: 3, 
    icon: "🔍",
    color: "from-green-500 to-green-600",
    description: "Quick & secure"
  },
  { 
    id: "bank_transfer", 
    name: "Bank Transfer", 
    fee: 2, 
    icon: "🏦",
    color: "from-purple-500 to-purple-600",
    description: "Lowest fees"
  },
]

const presetAmounts = [
  { value: 20, popular: false },
  { value: 50, popular: true },
  { value: 100, popular: false },
  { value: 200, popular: false },
]

export function FiatOnRamp({ onPurchase, className }: FiatOnRampProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [amount, setAmount] = React.useState<number>(50)
  const [paymentMethod, setPaymentMethod] = React.useState<string>("apple_pay")
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [transactionId, setTransactionId] = React.useState("")
  const [magicWalletInfo, setMagicWalletInfo] = useState<any>(null)

  useEffect(() => {
    const checkMagicWallet = async () => {
      const walletInfo = await magicWallet.getWalletInfo()
      if (walletInfo) {
        setMagicWalletInfo(walletInfo)
      }
    }
    checkMagicWallet()
  }, [])

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod)
  const platformFee = selectedMethod ? (amount * selectedMethod.fee) / 100 : 0
  const grossPoints = amount * 100 // €1 = 100 points
  const netPoints = grossPoints - (platformFee * 100)

  const handlePurchase = async () => {
    if (!amount) return

    setIsLoading(true)
    try {
      let response

      if (magicWalletInfo) {
        // Use Magic wallet service for seamless experience
        response = await magicWallet.purchasePuffPassPoints(
          parseFloat(amount.toString()), // Ensure amount is a string for consistency if needed
          paymentMethod
        )
      } else {
        // Fallback to regular API
        response = await fetch('/api/fiat-onramp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            paymentMethod,
            email: 'paygarjoe@yahoo.com' // In production, get from auth
          })
        })
        response = await response.json()
      }

      // Assuming response structure from magicWallet.purchasePuffPassPoints or fetch is similar
      if (response.success || response.transaction?.id) {
        setTransactionId(response.transaction?.id || 'N/A') // Handle potential missing transaction ID
        setStep(3)
        await onPurchase?.({
          amount,
          paymentMethod: paymentMethod as any,
          email,
        })
      } else {
        // Handle specific error scenarios if needed
        console.error('Purchase failed:', response.error || 'Unknown error')
        // Optionally set an error state to display to the user
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      // Optionally set an error state to display to the user
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        {/* Hero Section */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-4 left-1/4 w-16 h-16 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-8 right-1/4 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <OrganicCardTitle className="text-[var(--color-glow)] flex items-center gap-2">
            💳 Buy PuffPass Points
            {magicWalletInfo && (
              <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                ✨ Magic Wallet
              </span>
            )}
          </OrganicCardTitle>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Top up your PuffPass balance securely. Points are redeemable for perks and merchant credits.
          </p>
        </div>

        {/* Payment Method Selection */}
        <OrganicCard className="border-2 border-green-200 dark:border-green-800 shadow-lg">
          <OrganicCardContent className="p-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-center block">Choose Your Payment Method</Label>

              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id)
                      setStep(2)
                    }}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                      "bg-gradient-to-r text-white shadow-md",
                      method.color,
                      "hover:shadow-xl transform hover:-translate-y-1"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{method.icon}</div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">{method.name}</div>
                          <div className="text-sm opacity-90">{method.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {method.fee}% fee
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </OrganicCardContent>
        </OrganicCard>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setStep(1)}
            className="p-2"
          >
            ←
          </Button>
          <div>
            <h2 className="text-2xl font-bold">🌿 Purchase Details</h2>
            <p className="text-sm text-muted-foreground">
              via {selectedMethod?.name}
            </p>
          </div>
        </div>

        <OrganicCard className="border-2 border-green-200 dark:border-green-800 shadow-lg">
          <OrganicCardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handlePurchase(); }} className="space-y-6">
              {/* Amount Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Enter Amount</Label>

                {/* Preset amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setAmount(preset.value)}
                      className={cn(
                        "relative h-16 flex flex-col justify-center items-center rounded-lg border-2 transition-all",
                        amount === preset.value 
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300" 
                          : "border-gray-200 hover:border-green-300"
                      )}
                    >
                      {preset.popular && (
                        <Badge className="absolute -top-2 text-xs bg-yellow-500 text-white">
                          Popular
                        </Badge>
                      )}
                      <span className="font-bold">€{preset.value}</span>
                      <span className="text-xs opacity-75">{preset.value * 100} pts</span>
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div>
                  <Label htmlFor="custom-amount">Custom Amount</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="5"
                    max="500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="text-center text-xl font-bold mt-2"
                    placeholder="€50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email for Receipt</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              {/* Fee Breakdown */}
              <div className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-950/20 dark:to-yellow-950/20 p-4 rounded-xl space-y-3 border border-green-200 dark:border-green-800">
                <div className="text-center mb-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    🌿 {Math.floor(netPoints).toLocaleString()} PuffPass Points
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Purchase Amount:</span>
                    <span className="font-semibold">€{amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Platform Fee ({selectedMethod?.fee}%):</span>
                    <span>-€{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg text-green-600 dark:text-green-400">
                    <span>Net Points:</span>
                    <span>{Math.floor(netPoints).toLocaleString()} pts</span>
                  </div>
                </div>
              </div>

              {/* Closed Loop Warning */}
              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300 text-center">
                  ⚠️ <strong>Important:</strong> Points are non-withdrawable and can only be used within MyCora.
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                disabled={!email || amount < 5 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Your Stash...
                  </div>
                ) : (
                  `🌿 Confirm Purchase → ${Math.floor(netPoints).toLocaleString()} Points`
                )}
              </Button>
            </form>
          </OrganicCardContent>
        </OrganicCard>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className={cn("w-full max-w-md mx-auto text-center", className)}>
        {/* Success Animation */}
        <div className="mb-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
              <div className="text-4xl animate-bounce">✅</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            Success!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You've received <span className="font-bold text-green-600">{Math.floor(netPoints).toLocaleString()} PuffPass points</span>
          </p>
        </div>

        {/* Transaction Details */}
        <OrganicCard className="mb-6 border-2 border-green-200 dark:border-green-800">
          <OrganicCardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Transaction ID</div>
                <div className="font-mono text-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                  #{transactionId || 'PPX203948'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="font-semibold">Amount Paid</div>
                  <div className="text-lg">€{amount.toFixed(2)}</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="font-semibold">Platform Fee</div>
                  <div className="text-lg">€{platformFee.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </OrganicCardContent>
        </OrganicCard>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg rounded-xl shadow-lg"
            onClick={() => window.location.reload()}
          >
            🌿 View My Wallet
          </Button>

          <Button 
            variant="outline"
            className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 py-6 text-lg rounded-xl"
            onClick={() => setStep(1)}
          >
            💳 Buy More Points
          </Button>
        </div>

        {/* Reminder */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Next:</strong> Redeem your points for cannabis perks, dispensary credits, and exclusive rewards!
          </p>
        </div>
      </div>
    )
  }

  return null
}