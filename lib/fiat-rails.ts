import { ethers } from "ethers"

export interface UserRole {
  id: string
  email: string
  role: "user" | "admin" | "business"
  accountType: "individual" | "business"
  kycStatus: "pending" | "approved" | "rejected"
  businessVerified: boolean
}

export interface FiatTransaction {
  id: string
  userId: string
  type: "onramp" | "offramp"
  amount: number
  currency: "USD" | "EUR" | "GBP"
  status: "pending" | "completed" | "failed"
  timestamp: Date
  metadata: Record<string, any>
}

export class FiatRailsController {
  private provider: ethers.Provider
  private contract: ethers.Contract

  constructor(contractAddress: string, provider: ethers.Provider) {
    this.provider = provider
    // Contract ABI would be imported from the deployed contract
    this.contract = new ethers.Contract(contractAddress, [], provider)
  }

  // Check if user can off-ramp fiat
  canOffRampFiat(user: UserRole): boolean {
    return (
      user.role === "admin" ||
      (user.accountType === "business" && user.businessVerified && user.kycStatus === "approved")
    )
  }

  // All users can on-ramp fiat
  canOnRampFiat(user: UserRole): boolean {
    return user.kycStatus === "approved"
  }

  // Calculate fiat velocity and liquidity metrics
  async getFiatMetrics(): Promise<{
    totalLocked: number
    velocity: number
    activeUsers: number
  }> {
    // Implementation would query the smart contract and database
    return {
      totalLocked: 0,
      velocity: 0,
      activeUsers: 0,
    }
  }

  // Log fiat transaction for compliance
  async logFiatTransaction(transaction: FiatTransaction): Promise<void> {
    // Store in database and emit blockchain event
    console.log(`[v0] Logging fiat transaction: ${transaction.type} - $${transaction.amount}`)
  }
}

export const fiatRails = new FiatRailsController(
  process.env.FIAT_RAILS_CONTRACT_ADDRESS || "",
  new ethers.JsonRpcProvider(process.env.RPC_URL),
)
