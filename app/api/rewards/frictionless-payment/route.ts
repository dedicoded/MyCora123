import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, amount, merchantId } = await request.json()

    // Create or retrieve custodial wallet for email/phone
    const walletAddress = await createCustodialWallet(email || phone)

    // Run compliance checks silently
    const complianceResult = await runComplianceCheck(walletAddress, amount)

    if (!complianceResult.approved) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction requires additional verification",
          redirectUrl: `/kyc?wallet=${walletAddress}`,
        },
        { status: 400 },
      )
    }

    // Create payment intent with Magic.link or similar
    const paymentIntent = await createPaymentIntent({
      walletAddress,
      amount,
      merchantId,
      metadata: {
        email,
        phone,
        compliance: complianceResult.id,
      },
    })

    return NextResponse.json({
      success: true,
      paymentUrl: paymentIntent.url,
      walletAddress,
      estimatedConfirmation: "30 seconds",
    })
  } catch (error) {
    console.error("Frictionless payment error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Payment processing failed",
      },
      { status: 500 },
    )
  }
}

async function createCustodialWallet(identifier: string): Promise<string> {
  // Implementation would use Magic.link, Web3Auth, or similar
  // Returns deterministic wallet address based on email/phone
  return `0x${Buffer.from(identifier).toString("hex").padStart(40, "0")}`
}

async function runComplianceCheck(wallet: string, amount: number) {
  // Silent compliance check - no user friction
  return {
    approved: amount < 1000, // Simple threshold for demo
    id: `compliance_${Date.now()}`,
    riskScore: Math.random() * 100,
  }
}

async function createPaymentIntent(params: any) {
  // Create one-tap payment link
  return {
    url: `https://pay.mycora.com/intent/${params.walletAddress}`,
    id: `intent_${Date.now()}`,
  }
}
