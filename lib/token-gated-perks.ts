interface TokenGatedPerk {
  id: string
  name: string
  description: string
  requiredBalance: number
  requiredStakeDuration?: number // days
  perkType: "discount" | "access" | "reward" | "feature"
  value: string
  isActive: boolean
}

interface UserPerks {
  userId: string
  mccBalance: number
  stakeDuration: number
  availablePerks: TokenGatedPerk[]
  claimedPerks: string[]
}

export class TokenGatedPerksEngine {
  private static perks: TokenGatedPerk[] = [
    {
      id: "bronze_tier",
      name: "Bronze Member",
      description: "5% discount on all platform fees",
      requiredBalance: 100,
      perkType: "discount",
      value: "5",
      isActive: true,
    },
    {
      id: "silver_tier",
      name: "Silver Member",
      description: "10% discount + priority support",
      requiredBalance: 500,
      requiredStakeDuration: 30,
      perkType: "discount",
      value: "10",
      isActive: true,
    },
    {
      id: "gold_tier",
      name: "Gold Member",
      description: "15% discount + exclusive features",
      requiredBalance: 1000,
      requiredStakeDuration: 90,
      perkType: "feature",
      value: "premium_dashboard",
      isActive: true,
    },
    {
      id: "platinum_tier",
      name: "Platinum Member",
      description: "20% discount + early access to new features",
      requiredBalance: 5000,
      requiredStakeDuration: 365,
      perkType: "access",
      value: "early_access",
      isActive: true,
    },
    {
      id: "whale_rewards",
      name: "Whale Rewards",
      description: "Monthly bonus MCC tokens",
      requiredBalance: 10000,
      requiredStakeDuration: 365,
      perkType: "reward",
      value: "100",
      isActive: true,
    },
  ]

  static async getUserPerks(userId: string, mccBalance: number, stakeDuration: number): Promise<UserPerks> {
    const availablePerks = this.perks.filter((perk) => {
      const balanceCheck = mccBalance >= perk.requiredBalance
      const stakeCheck = !perk.requiredStakeDuration || stakeDuration >= perk.requiredStakeDuration
      return perk.isActive && balanceCheck && stakeCheck
    })

    // Get claimed perks from database (mock for now)
    const claimedPerks = await this.getClaimedPerks(userId)

    return {
      userId,
      mccBalance,
      stakeDuration,
      availablePerks,
      claimedPerks,
    }
  }

  static async claimPerk(userId: string, perkId: string): Promise<boolean> {
    try {
      // Verify user eligibility
      const userPerks = await this.getUserPerks(userId, 0, 0) // Would get real data
      const perk = userPerks.availablePerks.find((p) => p.id === perkId)

      if (!perk) {
        throw new Error("Perk not available")
      }

      // Record perk claim in database
      await this.recordPerkClaim(userId, perkId)

      // Execute perk logic based on type
      switch (perk.perkType) {
        case "reward":
          await this.distributeBonusTokens(userId, Number.parseInt(perk.value))
          break
        case "feature":
          await this.enableFeature(userId, perk.value)
          break
        case "access":
          await this.grantAccess(userId, perk.value)
          break
        case "discount":
          await this.applyDiscount(userId, Number.parseInt(perk.value))
          break
      }

      return true
    } catch (error) {
      console.error("Failed to claim perk:", error)
      return false
    }
  }

  static calculateDiscountRate(mccBalance: number, stakeDuration: number): number {
    let discount = 0

    if (mccBalance >= 100) discount = 5
    if (mccBalance >= 500 && stakeDuration >= 30) discount = 10
    if (mccBalance >= 1000 && stakeDuration >= 90) discount = 15
    if (mccBalance >= 5000 && stakeDuration >= 365) discount = 20

    return discount
  }

  static hasFeatureAccess(mccBalance: number, stakeDuration: number, feature: string): boolean {
    const featureRequirements: Record<string, { balance: number; duration: number }> = {
      premium_dashboard: { balance: 1000, duration: 90 },
      early_access: { balance: 5000, duration: 365 },
      advanced_analytics: { balance: 2500, duration: 180 },
      priority_support: { balance: 500, duration: 30 },
    }

    const requirement = featureRequirements[feature]
    if (!requirement) return false

    return mccBalance >= requirement.balance && stakeDuration >= requirement.duration
  }

  private static async getClaimedPerks(userId: string): Promise<string[]> {
    // Mock implementation - would query database
    return []
  }

  private static async recordPerkClaim(userId: string, perkId: string): Promise<void> {
    // Mock implementation - would insert into database
    console.log(`Recording perk claim: ${userId} claimed ${perkId}`)
  }

  private static async distributeBonusTokens(userId: string, amount: number): Promise<void> {
    // Mock implementation - would mint/transfer tokens
    console.log(`Distributing ${amount} bonus MCC to ${userId}`)
  }

  private static async enableFeature(userId: string, feature: string): Promise<void> {
    // Mock implementation - would update user permissions
    console.log(`Enabling feature ${feature} for ${userId}`)
  }

  private static async grantAccess(userId: string, accessType: string): Promise<void> {
    // Mock implementation - would update access permissions
    console.log(`Granting ${accessType} access to ${userId}`)
  }

  private static async applyDiscount(userId: string, discountRate: number): Promise<void> {
    // Mock implementation - would update user discount rate
    console.log(`Applying ${discountRate}% discount for ${userId}`)
  }
}

export type { TokenGatedPerk, UserPerks }
