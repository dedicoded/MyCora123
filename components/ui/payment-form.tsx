"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { OrganicCard, OrganicCardContent, OrganicCardHeader, OrganicCardTitle } from "@/components/ui/organic-card"
import { TrustIndicator } from "@/components/ui/trust-indicator"
import { ComplianceBadge } from "@/components/ui/compliance-badge"
import { cn } from "@/lib/utils"

interface PaymentFormProps {
  onSubmit?: (data: PaymentFormData) => void
  className?: string
}

interface PaymentFormData {
  payeeAddress: string
  amount: number
  currency: "USDC" | "USDT" | "DAI"
  reference?: string
  escrow: boolean
  escrowPeriod?: number
}

export function PaymentForm({ onSubmit, className }: PaymentFormProps) {
  const [formData, setFormData] = React.useState<PaymentFormData>({
    payeeAddress: "",
    amount: 0,
    currency: "USDC",
    reference: "",
    escrow: false,
    escrowPeriod: 7,
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [payeeInfo, setPayeeInfo] = React.useState<{
    trustScore?: number
    complianceStatus?: "pass" | "warning" | "fail"
    isVerified?: boolean
  } | null>(null)

  // Mock payee validation
  const validatePayee = React.useCallback(async (address: string) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return null

    // Mock API call to get payee information
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      trustScore: Math.floor(Math.random() * 100),
      complianceStatus: ["pass", "warning", "fail"][Math.floor(Math.random() * 3)] as "pass" | "warning" | "fail",
      isVerified: Math.random() > 0.3,
    }
  }, [])

  React.useEffect(() => {
    if (formData.payeeAddress.length === 42) {
      validatePayee(formData.payeeAddress).then(setPayeeInfo)
    } else {
      setPayeeInfo(null)
    }
  }, [formData.payeeAddress, validatePayee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit?.(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateFees = () => {
    const processingFee = formData.amount * 0.0025
    const networkFee = 0.5
    return { processingFee, networkFee, total: processingFee + networkFee }
  }

  const fees = calculateFees()

  return (
    <OrganicCard className={cn("w-full max-w-md", className)} variant="trust">
      <OrganicCardHeader>
        <OrganicCardTitle>Send Payment</OrganicCardTitle>
      </OrganicCardHeader>
      <OrganicCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payee Address */}
          <div className="space-y-2">
            <Label htmlFor="payeeAddress">Recipient Address</Label>
            <Input
              id="payeeAddress"
              placeholder="0x..."
              value={formData.payeeAddress}
              onChange={(e) => setFormData((prev) => ({ ...prev, payeeAddress: e.target.value }))}
              className="font-mono text-sm"
            />

            {/* Payee Information */}
            {payeeInfo && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <TrustIndicator score={payeeInfo.trustScore} size="sm" />
                <ComplianceBadge status={payeeInfo.complianceStatus} size="sm" />
                {payeeInfo.isVerified && <span className="text-xs text-primary font-medium">✓ Verified</span>}
              </div>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: "USDC" | "USDT" | "DAI") =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="DAI">DAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              placeholder="Invoice #, description, etc."
              value={formData.reference}
              onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
            />
          </div>

          {/* Escrow Option */}
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="space-y-1">
              <Label htmlFor="escrow" className="text-sm font-medium">
                Use Escrow
              </Label>
              <p className="text-xs text-muted-foreground">Hold payment in escrow for {formData.escrowPeriod} days</p>
            </div>
            <Switch
              id="escrow"
              checked={formData.escrow}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, escrow: checked }))}
            />
          </div>

          {/* Escrow Period */}
          {formData.escrow && (
            <div className="space-y-2">
              <Label htmlFor="escrowPeriod">Escrow Period (Days)</Label>
              <Select
                value={formData.escrowPeriod?.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, escrowPeriod: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fee Breakdown */}
          {formData.amount > 0 && (
            <div className="p-3 bg-muted rounded-md space-y-1">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>
                  {formData.amount.toFixed(2)} {formData.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing Fee (0.25%):</span>
                <span>
                  {fees.processingFee.toFixed(2)} {formData.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Network Fee:</span>
                <span>
                  {fees.networkFee.toFixed(2)} {formData.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Total Cost:</span>
                <span>
                  {(formData.amount + fees.total).toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={!formData.payeeAddress || !formData.amount || isLoading}>
            {isLoading ? "Processing..." : formData.escrow ? "Create Escrow Payment" : "Send Payment"}
          </Button>
        </form>
      </OrganicCardContent>
    </OrganicCard>
  )
}
