import { type NextRequest, NextResponse } from "next/server"

interface PaymentStatus {
  paymentId: string
  status: "pending" | "completed" | "failed" | "cancelled" | "in_escrow" | "released"
  amount: number
  currency: string
  payerAddress: string
  payeeAddress: string
  transactionHash?: string
  createdAt: string
  completedAt?: string
  escrowReleaseTime?: string
  fees: {
    processingFee: number
    networkFee: number
    total: number
  }
  reference?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const address = searchParams.get("address")

    if (!paymentId && !address) {
      return NextResponse.json({ error: "Either paymentId or address parameter is required" }, { status: 400 })
    }

    if (paymentId) {
      // Get specific payment status
      const payment = await getPaymentById(paymentId)
      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }
      return NextResponse.json({ payment })
    }

    if (address) {
      // Get payment history for address
      const payments = await getPaymentsByAddress(address)
      return NextResponse.json({
        payments,
        total: payments.length,
        address,
      })
    }
  } catch (error) {
    console.error("[v0] Payment status error:", error)
    return NextResponse.json({ error: "Payment status retrieval failed" }, { status: 500 })
  }
}

async function getPaymentById(paymentId: string): Promise<PaymentStatus | null> {
  // Mock payment retrieval - in production, query from database
  const mockPayment: PaymentStatus = {
    paymentId,
    status: "completed",
    amount: 1000,
    currency: "USDC",
    payerAddress: "0x1234567890123456789012345678901234567890",
    payeeAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    fees: {
      processingFee: 2.5,
      networkFee: 0.5,
      total: 3.0,
    },
    reference: "Invoice #12345",
  }

  return mockPayment
}

async function getPaymentsByAddress(address: string): Promise<PaymentStatus[]> {
  // Mock payment history - in production, query from database
  const mockPayments: PaymentStatus[] = [
    {
      paymentId: "payment_1703123456789_abc123",
      status: "completed",
      amount: 500,
      currency: "USDC",
      payerAddress: address,
      payeeAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: new Date(Date.now() - 86000000).toISOString(),
      fees: { processingFee: 1.25, networkFee: 0.5, total: 1.75 },
      reference: "Coffee purchase",
    },
    {
      paymentId: "payment_1703123456790_def456",
      status: "in_escrow",
      amount: 2000,
      currency: "USDT",
      payerAddress: address,
      payeeAddress: "0x9876543210987654321098765432109876543210",
      transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      escrowReleaseTime: new Date(Date.now() + 518400000).toISOString(), // 6 days from now
      fees: { processingFee: 5.0, networkFee: 0.5, total: 5.5 },
      reference: "Freelance work",
    },
  ]

  return mockPayments
}
