import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { UTILITY_ABI } from "../../../UTILITY_ABI"

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json()

    const UTILITY_TOKEN_ADDRESS = process.env.UTILITY_TOKEN_ADDRESS as `0x${string}`
    const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL
    const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "1" ? mainnet : sepolia

    if (!UTILITY_TOKEN_ADDRESS) {
      return NextResponse.json({ error: "Contract not configured" }, { status: 500 })
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(RPC_URL),
    })

    const tokenURI = await publicClient.readContract({
      address: UTILITY_TOKEN_ADDRESS,
      abi: UTILITY_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    })

    return NextResponse.json({ tokenURI })
  } catch (error) {
    console.error("Error fetching token metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
