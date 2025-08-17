import { type NextRequest, NextResponse } from "next/server"
import { fiatRails, type UserRole, type FiatTransaction } from "@/lib/fiat-rails"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, currency, paymentMethod } = await request.json()

    // Get user from database (mock implementation)
    const user: UserRole = {
      id: userId,
      email: "user@example.com",
      role: "user",
      accountType: "individual",
      kycStatus: "approved",
      businessVerified: false,
    }

    // Check if user can on-ramp
    if (!fiatRails.canOnRampFiat(user)) {
      return NextResponse.json({ error: "KYC approval required for fiat deposits" }, { status: 403 })
    }

    // Create fiat transaction
    const transaction: FiatTransaction = {
      id: `onramp_${Date.now()}`,
      userId,
      type: "onramp",
      amount,
      currency,
      status: "pending",
      timestamp: new Date(),
      metadata: { paymentMethod },
    }

    // Process payment (integrate with Stripe, etc.)
    // For demo, we'll simulate success
    transaction.status = "completed"

    // Log transaction
    await fiatRails.logFiatTransaction(transaction)

    return NextResponse.json({
      success: true,
      transaction,
      message: "Fiat deposited successfully. Funds are now available in your MyCora account.",
    })
  } catch (error) {
    console.error("[v0] Fiat on-ramp error:", error)
    return NextResponse.json({ error: "Failed to process fiat deposit" }, { status: 500 })
  }
}
