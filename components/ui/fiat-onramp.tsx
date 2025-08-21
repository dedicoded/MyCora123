
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganicCard, OrganicCardContent, OrganicCardHeader, OrganicCardTitle } from "@/components/ui/organic-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FiatOnRampProps {
  onPurchase?: (data: PurchaseData) => void
  className?: string
}

interface PurchaseData {
  amount: number
  paymentMethod: "credit" | "debit" | "apple_pay" | "google_pay" | "bank_transfer"
  email: string
}

const paymentMethods = [
  { id: "credit", name: "Credit Card", fee: 5, icon: "💳" },
  { id: "debit", name: "Debit Card", fee: 3.5, icon: "💳" },
  { id: "apple_pay", name: "Apple Pay", fee: 3, icon: "🍎" },
  { id: "google_pay", name: "Google Pay", fee: 3, icon: "🔍" },
  { id: "bank_transfer", name: "Bank Transfer", fee: 1.5, icon: "🏦" },
]

export function FiatOnRamp({ onPurchase, className }: FiatOnRampProps) {
  const [amount, setAmount] = React.useState<number>(20)
  const [paymentMethod, setPaymentMethod] = React.useState<string>("apple_pay")
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod)
  const platformFee = selectedMethod ? (amount * selectedMethod.fee) / 100 : 0
  const puffPassPoints = (amount - platformFee) * 100 // 1 USD = 100 points
  
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onPurchase?.({
        amount,
        paymentMethod: paymentMethod as any,
        email,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OrganicCard className={cn("w-full max-w-md", className)} variant="elevated">
      <OrganicCardHeader className="text-center">
        <OrganicCardTitle className="flex items-center justify-center gap-2">
          🌿 Buy PuffPass Points
        </OrganicCardTitle>
        <p className="text-sm text-muted-foreground">
          Load up your stash with instant points
        </p>
      </OrganicCardHeader>
      <OrganicCardContent>
        <form onSubmit={handlePurchase} className="space-y-4">
          {/* Amount Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Your Boost</Label>
            <div className="grid grid-cols-3 gap-2">
              {[20, 50, 100].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  className="h-16 flex flex-col"
                  onClick={() => setAmount(preset)}
                >
                  <span className="text-lg font-bold">${preset}</span>
                  <span className="text-xs opacity-75">{preset * 100} pts</span>
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                min="5"
                max="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="text-center text-lg font-medium"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      <span>{method.icon}</span>
                      <span>{method.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {method.fee}% fee
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email for Receipt</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Fee Breakdown */}
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Purchase Amount:</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee ({selectedMethod?.fee}%):</span>
              <span>-${platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>PuffPass Points:</span>
              <span className="text-green-600 dark:text-green-400">
                🌿 {Math.floor(puffPassPoints)} pts
              </span>
            </div>
          </div>

          {/* Closed Loop Disclaimer */}
          <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
            <p className="text-xs text-orange-700 dark:text-orange-300">
              🔒 <strong>Closed Loop System:</strong> Points are non-withdrawable and can only be used within MyCora for rewards and merchant credits.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={!email || amount < 5 || isLoading}
          >
            {isLoading ? (
              "Processing Your Stash..."
            ) : (
              `🌿 Buy ${Math.floor(puffPassPoints)} PuffPass Points`
            )}
          </Button>
        </form>
      </OrganicCardContent>
    </OrganicCard>
  )
}
