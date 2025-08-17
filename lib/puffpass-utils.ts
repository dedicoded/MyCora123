export function getPuffPassTier(purchaseCount: number): {
  tier: "Green" | "Gold" | "Black" | "None"
  tokenId: number
  uri: string
  nextTierThreshold?: number
  progress?: number
} {
  if (purchaseCount >= 25) {
    return {
      tier: "Black",
      tokenId: 3,
      uri: "ipfs://QmBlackTierMetadata",
    }
  } else if (purchaseCount >= 10) {
    return {
      tier: "Gold",
      tokenId: 2,
      uri: "ipfs://QmGoldTierMetadata",
      nextTierThreshold: 25,
      progress: (purchaseCount - 10) / (25 - 10),
    }
  } else if (purchaseCount >= 3) {
    return {
      tier: "Green",
      tokenId: 1,
      uri: "ipfs://QmGreenTierMetadata",
      nextTierThreshold: 10,
      progress: (purchaseCount - 3) / (10 - 3),
    }
  } else {
    return {
      tier: "None",
      tokenId: 0,
      uri: "",
      nextTierThreshold: 3,
      progress: purchaseCount / 3,
    }
  }
}

export function getTierBenefits(tier: string): string[] {
  switch (tier) {
    case "Black":
      return ["25% discount", "VIP access", "Free delivery", "Exclusive products"]
    case "Gold":
      return ["15% discount", "Priority support", "Free delivery"]
    case "Green":
      return ["10% discount", "Member pricing"]
    default:
      return []
  }
}
