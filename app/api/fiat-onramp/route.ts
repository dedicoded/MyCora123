import { type NextRequest, NextResponse } from "next/server"

interface OnRampRequest {
  amount: number
  paymentMethod: "credit" | "debit" | "apple_pay" | "google_pay" | "bank_transfer"
  email: string
  userId?: string
  provider?: string
  walletAddress?: string
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
    const body = await request.json() as OnRampRequest
    const { amount, paymentMethod, email, userId } = body

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
  const provider = body.provider || 'traditional'

  console.log('[v0] Fiat on-ramp transaction:', {
    transactionId,
    amount: `$${amount}`,
    fee: `$${platformFee.toFixed(2)} (${Math.round(feePercentage)}%)`,
    points: `${puffPassPoints} PuffPass points`,
    paymentMethod,
    email,
    provider,
    walletAddress: body.walletAddress || 'N/A'
  })

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

    // Enhanced response for Magic wallets
  const response: any = {
    success: true,
    transactionId,
    purchasedPoints: puffPassPoints,
    feeCharged: platformFee,
    paymentMethod,
    message: `Successfully purchased ${puffPassPoints} PuffPass points! 🌿`,

    // Cannabis-themed confirmation
    cannabisMessage: "Your PuffPass is now loaded and ready for cannabis purchases! 💚"
  }

  // Add Magic wallet specific info
  if (provider === 'magic' && body.walletAddress) {
    response.magicWallet = {
      address: body.walletAddress,
      embedded: true,
      message: "✨ Points added to your embedded wallet - no extensions needed!"
    }
  }

  return NextResponse.json(response)

  } catch (error) {
    console.error("[v0] Fiat on-ramp error:", error)
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    )
  }
}