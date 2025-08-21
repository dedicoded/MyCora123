
import { type NextRequest, NextResponse } from "next/server"

interface OnRampRequest {
  amount: number
  paymentMethod: "credit" | "debit" | "apple_pay" | "google_pay" | "bank_transfer"
  email: string
  userId?: string
}

const paymentMethodFees = {
  credit: 5.0,      // 5%
  debit: 3.5,       // 3.5%
  apple_pay: 3.0,   // 3%
  google_pay: 3.0,  // 3%
  bank_transfer: 1.5 // 1.5%
}

export async function POST(request: NextRequest) {
  try {
    const { amount, paymentMethod, email, userId } = await request.json() as OnRampRequest

    // Validate input
    if (!amount || amount < 5 || amount > 500) {
      return NextResponse.json(
        { error: "Amount must be between $5 and $500" },
        { status: 400 }
      )
    }

    if (!paymentMethod || !paymentMethodFees[paymentMethod]) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      )
    }

    // Calculate fees and points
    const feePercentage = paymentMethodFees[paymentMethod]
    const platformFee = (amount * feePercentage) / 100
    const netAmount = amount - platformFee
    const puffPassPoints = Math.floor(netAmount * 100) // 1 USD = 100 points

    // Create transaction record
    const transactionId = `onramp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const transaction = {
      id: transactionId,
      type: "fiat_onramp",
      userId: userId || `guest_${email.split('@')[0]}`,
      email,
      amount,
      paymentMethod,
      platformFee,
      netAmount,
      puffPassPoints,
      status: "completed", // In production, this would be "pending" until payment confirms
      timestamp: new Date().toISOString(),
      metadata: {
        closedLoop: true,
        nonWithdrawable: true,
        redeemableFor: ["rewards", "merchant_credits", "perks"]
      }
    }

    // Log transaction for compliance
    console.log(`[v0] Fiat on-ramp transaction:`, {
      transactionId,
      amount: `$${amount}`,
      fee: `$${platformFee.toFixed(2)} (${feePercentage}%)`,
      points: `${puffPassPoints} PuffPass points`,
      paymentMethod,
      email
    })

    // In production, you would:
    // 1. Process payment via Stripe/payment processor
    // 2. Update user's PuffPass points in database
    // 3. Send confirmation email
    // 4. Log to compliance system

    return NextResponse.json({
      success: true,
      transaction,
      message: `Successfully loaded ${puffPassPoints} PuffPass points to your account!`,
      receipt: {
        transactionId,
        purchaseAmount: `$${amount.toFixed(2)}`,
        platformFee: `$${platformFee.toFixed(2)}`,
        pointsReceived: puffPassPoints,
        paymentMethod: paymentMethod.replace('_', ' ').toUpperCase(),
        timestamp: transaction.timestamp,
        closedLoopNotice: "Points are non-withdrawable and redeemable only within MyCora cannabis network"
      }
    })

  } catch (error) {
    console.error("[v0] Fiat on-ramp error:", error)
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    )
  }
}
