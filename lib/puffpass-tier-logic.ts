export interface PuffPassTier {
  tier: string
  tokenId: number
  uri: string
  benefits: string[]
  discount: number
}

export function getPuffPassTier(purchaseCount: number): PuffPassTier {
  if (purchaseCount >= 25) {
    return {
      tier: "Black",
      tokenId: 3,
      uri: "ipfs://QmBlackMetadataHash",
      benefits: ["25% discount", "VIP access", "Free delivery", "Exclusive products"],
      discount: 0.25,
    }
  } else if (purchaseCount >= 10) {
    return {
      tier: "Gold",
      tokenId: 2,
      uri: "ipfs://QmGoldMetadataHash",
      benefits: ["15% discount", "Priority support", "Free delivery"],
      discount: 0.15,
    }
  } else if (purchaseCount >= 3) {
    return {
      tier: "Green",
      tokenId: 1,
      uri: "ipfs://QmGreenMetadataHash",
      benefits: ["10% discount", "Member pricing"],
      discount: 0.1,
    }
  } else {
    return {
      tier: "None",
      tokenId: 0,
      uri: "",
      benefits: [],
      discount: 0,
    }
  }
}

export function getNextTierRequirement(currentPurchases: number): number | null {
  if (currentPurchases < 3) return 3
  if (currentPurchases < 10) return 10
  if (currentPurchases < 25) return 25
  return null // Max tier reached
}

export function getTierProgress(currentPurchases: number): { current: number; next: number | null; progress: number } {
  const nextRequired = getNextTierRequirement(currentPurchases)
  if (!nextRequired) return { current: currentPurchases, next: null, progress: 100 }

  const previousTier = nextRequired === 3 ? 0 : nextRequired === 10 ? 3 : 10
  const progress = ((currentPurchases - previousTier) / (nextRequired - previousTier)) * 100

  return { current: currentPurchases, next: nextRequired, progress: Math.min(progress, 100) }
}
