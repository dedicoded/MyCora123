import { type NextRequest, NextResponse } from "next/server"
import { fiatRails, type UserRole, type FiatTransaction } from "@/lib/fiat-rails"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, currency, bankAccount } = await request.json()

    // Get user from database (mock implementation)
    const user: UserRole = {
      id: userId,
      email: "user@example.com",
      role: "user", // This would be fetched from actual user data
      accountType: "individual",
      kycStatus: "approved",
      businessVerified: false,
    }

    if (!fiatRails.canOffRampFiat(user)) {
      return NextResponse.json(
        {
          error: "Fiat withdrawals are only available for verified business accounts and administrators.",
          suggestion: "Consider using crypto-native options like staking, NFT rewards, or peer-to-peer trading.",
          upgradeUrl: "/upgrade-to-business",
        },
        { status: 403 },
      )
    }

    // Create fiat transaction
    const transaction: FiatTransaction = {
      id: `offramp_${Date.now()}`,
      userId,
      type: "offramp",
      amount,
      currency,
      status: "pending",
      timestamp: new Date(),
      metadata: { bankAccount },
    }

    // Process withdrawal (integrate with banking APIs)
    // Enhanced compliance logging for off-ramp transactions
    transaction.status = "completed"

    // Log transaction with enhanced monitoring
    await fiatRails.logFiatTransaction(transaction)

    return NextResponse.json({
      success: true,
      transaction,
      message: "Fiat withdrawal processed successfully.",
    })
  } catch (error) {
    console.error("[v0] Fiat off-ramp error:", error)
    return NextResponse.json({ error: "Failed to process fiat withdrawal" }, { status: 500 })
  }
}
