import { supabase, db } from "@/lib/supabase"

export class ComplianceService {
  async checkKYC(walletAddress: string) {
    // Check if user profile exists
    const { data: profile, error } = await db.getUserProfile(walletAddress)
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`KYC check failed: ${error.message}`)
    }

    if (profile) {
      return {
        userId: profile.id,
        status: profile.kyc_status,
        documents: [],
        riskScore: profile.compliance_score,
        lastUpdated: profile.updated_at,
      }
    }

    // Create new user profile with pending KYC
    const kycStatus = {
      wallet_address: walletAddress,
      kyc_status: "pending" as const,
      compliance_score: Math.floor(Math.random() * 100),
    }

    const { data: newProfile, error: createError } = await db.createUserProfile(kycStatus)
    
    if (createError) {
      throw new Error(`Failed to create user profile: ${createError.message}`)
    }

    return {
      userId: newProfile.id,
      status: newProfile.kyc_status,
      documents: [],
      riskScore: newProfile.compliance_score,
      lastUpdated: newProfile.created_at,
    }
  }

  async assessRisk(params: { userId: string; transactionAmount?: number; jurisdiction?: string }) {
    const { userId, transactionAmount = 0, jurisdiction = "US" } = params

    const userHistory = await this.getUserTransactionHistory(userId)
    const jurisdictionRules = await this.getJurisdictionRules(jurisdiction)

    let riskScore = 0

    // Transaction amount risk
    if (transactionAmount > 10000) riskScore += 30
    else if (transactionAmount > 5000) riskScore += 15

    // User history risk
    if (userHistory.suspiciousActivity) riskScore += 25
    if (userHistory.transactionCount < 5) riskScore += 10

    // Jurisdiction risk
    if (jurisdictionRules.highRisk) riskScore += 20

    return {
      riskScore: Math.min(riskScore, 100),
      level: riskScore > 70 ? "high" : riskScore > 40 ? "medium" : "low",
      factors: {
        transactionAmount: transactionAmount > 5000,
        userHistory: userHistory.suspiciousActivity,
        jurisdiction: jurisdictionRules.highRisk,
      },
    }
  }

  private async getUserTransactionHistory(userId: string) {
    return {
      transactionCount: Math.floor(Math.random() * 50),
      suspiciousActivity: Math.random() > 0.8,
      totalVolume: Math.floor(Math.random() * 100000),
    }
  }

  private async getJurisdictionRules(jurisdiction: string) {
    const highRiskJurisdictions = ["CN", "IR", "KP", "RU"]
    return {
      jurisdiction,
      highRisk: highRiskJurisdictions.includes(jurisdiction),
      kycRequired: true,
      maxTransactionAmount: jurisdiction === "US" ? 50000 : 10000,
    }
  }
}
