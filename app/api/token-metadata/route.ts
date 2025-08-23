import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"
import utilityABI from '@/lib/abi/Utility.json';

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json()

    // Validate input
    if (tokenId === undefined || tokenId === null) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 })
    }

    const UTILITY_TOKEN_ADDRESS = process.env.UTILITY_TOKEN_ADDRESS as `0x${string}`
    const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL
    const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "1" ? mainnet : sepolia

    if (!UTILITY_TOKEN_ADDRESS || UTILITY_TOKEN_ADDRESS === "" || UTILITY_TOKEN_ADDRESS === "0x") {
      return NextResponse.json({ error: "Utility token contract address not configured" }, { status: 500 })
    }

    if (!RPC_URL) {
      return NextResponse.json({ error: "RPC URL not configured" }, { status: 500 })
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(RPC_URL),
    })

    const tokenURI = await publicClient.readContract({
      address: UTILITY_TOKEN_ADDRESS,
      abi: utilityABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    })

    return NextResponse.json({ tokenURI })
  } catch (error) {
    console.error("Error fetching token metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}