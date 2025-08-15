import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { SECURITY_ABI } from "../../../SECURITY_ABI"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    const SECURITY_TOKEN_ADDRESS = process.env.SECURITY_TOKEN_ADDRESS as `0x${string}`
    const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL
    const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "1" ? mainnet : sepolia

    if (!SECURITY_TOKEN_ADDRESS) {
      return NextResponse.json({ error: "Contract not configured" }, { status: 500 })
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(RPC_URL),
    })

    const balance = await publicClient.readContract({
      address: SECURITY_TOKEN_ADDRESS,
      abi: SECURITY_ABI,
      functionName: "balanceOf",
      args: [address],
    })

    return NextResponse.json({ balance: balance.toString() })
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
