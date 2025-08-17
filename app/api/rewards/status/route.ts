import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function POST(request: NextRequest) {
  try {
    const { customerEmail } = await request.json()

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email required" }, { status: 400 })
    }

    // Get custodial wallet address from email
    const walletAddress = "0x" + ethers.keccak256(ethers.toUtf8Bytes(customerEmail)).slice(2, 42)

    // Get user status from contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const contract = new ethers.Contract(
      process.env.PUFFPASS_CONTRACT_ADDRESS!,
      ["function getUserStatus(address) view returns (uint256, uint256, string, string, uint256)"],
      provider,
    )

    const [points, tier, tierName, perks, nextTierRequirement] = await contract.getUserStatus(walletAddress)

    return NextResponse.json({
      success: true,
      status: {
        points: points.toString(),
        tier: tier.toString(),
        tierName,
        perks,
        nextTierRequirement: nextTierRequirement.toString(),
      },
    })
  } catch (error) {
    console.error("Status fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 })
  }
}
