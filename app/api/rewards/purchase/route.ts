import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, purchaseAmount, dispensaryId } = await request.json()

    if (!customerEmail || !purchaseAmount) {
      return NextResponse.json({ error: "Customer email and purchase amount required" }, { status: 400 })
    }

    // Get or create custodial wallet for customer
    const customerWallet = await getOrCreateCustodialWallet(customerEmail)

    // Record purchase on blockchain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const signer = new ethers.Wallet(process.env.REWARDS_PRIVATE_KEY!, provider)

    const puffPassContract = new ethers.Contract(
      process.env.PUFFPASS_CONTRACT_ADDRESS!,
      ["function recordPurchase(address customer) external"],
      signer,
    )

    const tx = await puffPassContract.recordPurchase(customerWallet.address)
    await tx.wait()

    // Get updated user status
    const userStatus = await getUserRewardStatus(customerWallet.address)

    return NextResponse.json({
      success: true,
      transaction: tx.hash,
      customerStatus: userStatus,
      message: userStatus.tierUpgraded
        ? `Congratulations! ${userStatus.tierName} Unlocked!`
        : `${userStatus.nextTierRequirement} more purchases to next tier!`,
    })
  } catch (error) {
    console.error("Purchase recording error:", error)
    return NextResponse.json({ error: "Failed to record purchase" }, { status: 500 })
  }
}

async function getOrCreateCustodialWallet(email: string) {
  // This would integrate with Magic.link or similar service
  return {
    address: "0x" + ethers.keccak256(ethers.toUtf8Bytes(email)).slice(2, 42),
    encrypted: true,
  }
}

async function getUserRewardStatus(address: string) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
  const contract = new ethers.Contract(
    process.env.PUFFPASS_CONTRACT_ADDRESS!,
    ["function getUserStatus(address) view returns (uint256, uint256, string, string, uint256)"],
    provider,
  )

  const [points, tier, tierName, perks, nextTierRequirement] = await contract.getUserStatus(address)

  return {
    points: points.toString(),
    tier: tier.toString(),
    tierName,
    perks,
    nextTierRequirement: nextTierRequirement.toString(),
    tierUpgraded: false, // Would be determined by comparing with previous state
  }
}
