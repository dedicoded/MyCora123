import { type NextRequest, NextResponse } from "next/server"

interface EscrowActionRequest {
  paymentId: string
  action: "release" | "cancel"
  signature?: string
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId, action, signature }: EscrowActionRequest = await request.json()

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Missing required fields: paymentId, action" }, { status: 400 })
    }

    // Get payment details
    const payment = await getEscrowPayment(paymentId)
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== "in_escrow") {
      return NextResponse.json({ error: "Payment is not in escrow" }, { status: 400 })
    }

    // Validate action permissions
    const currentTime = new Date()
    const escrowReleaseTime = new Date(payment.escrowReleaseTime!)

    if (action === "release") {
      // Check if escrow period has expired (auto-release) or if authorized
      const canAutoRelease = currentTime >= escrowReleaseTime
      const isAuthorizedRelease = signature // Mock signature validation

      if (!canAutoRelease && !isAuthorizedRelease) {
        return NextResponse.json(
          {
            error: "Cannot release escrow",
            reason: "Escrow period not expired and no valid authorization",
            releaseTime: escrowReleaseTime.toISOString(),
          },
          { status: 403 },
        )
      }

      // Process escrow release
      const result = await releaseEscrow(paymentId)

      // Log escrow release
      await logEscrowEvent({
        eventType: "ESCROW_RELEASED",
        paymentId,
        amount: payment.amount,
        payeeAddress: payment.payeeAddress,
        timestamp: new Date().toISOString(),
        autoRelease: canAutoRelease,
      })

      return NextResponse.json({
        success: true,
        action: "release",
        paymentId,
        transactionHash: result.transactionHash,
        releasedAmount: result.netAmount,
        fees: result.fees,
      })
    }

    if (action === "cancel") {
      // Check if cancellation is allowed (before escrow expiry)
      if (currentTime >= escrowReleaseTime) {
        return NextResponse.json(
          {
            error: "Cannot cancel escrow",
            reason: "Escrow period has expired",
          },
          { status: 403 },
        )
      }

      // Process escrow cancellation
      const result = await cancelEscrow(paymentId)

      // Log escrow cancellation
      await logEscrowEvent({
        eventType: "ESCROW_CANCELLED",
        paymentId,
        amount: payment.amount,
        payerAddress: payment.payerAddress,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        action: "cancel",
        paymentId,
        transactionHash: result.transactionHash,
        refundedAmount: result.refundAmount,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Escrow action error:", error)
    return NextResponse.json({ error: "Escrow action failed" }, { status: 500 })
  }
}

async function getEscrowPayment(paymentId: string) {
  // Mock escrow payment retrieval
  return {
    paymentId,
    status: "in_escrow" as const,
    amount: 2000,
    currency: "USDC",
    payerAddress: "0x1234567890123456789012345678901234567890",
    payeeAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    escrowReleaseTime: new Date(Date.now() + 518400000).toISOString(), // 6 days from now
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
}

async function releaseEscrow(paymentId: string) {
  // Mock escrow release - in production, interact with PaymentProcessor contract
  const processingFee = 5.0
  const netAmount = 1995.0

  return {
    transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
    netAmount,
    fees: { processingFee, networkFee: 0.5, total: 5.5 },
  }
}

async function cancelEscrow(paymentId: string) {
  // Mock escrow cancellation - in production, interact with PaymentProcessor contract
  return {
    transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
    refundAmount: 2000,
  }
}

async function logEscrowEvent(event: any) {
  console.log("[v0] Escrow Event:", JSON.stringify(event, null, 2))
}
