import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"
import securityABI from '@/lib/abi/Security.json';
import utilityABI from '@/lib/abi/Utility.json';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    // Validate input address
    if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 })
    }

    const SECURITY_TOKEN_ADDRESS = process.env.SECURITY_TOKEN_ADDRESS as `0x${string}`
    const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL
    const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "1" ? mainnet : sepolia

    if (!SECURITY_TOKEN_ADDRESS || SECURITY_TOKEN_ADDRESS === "" || SECURITY_TOKEN_ADDRESS === "0x") {
      return NextResponse.json({ error: "Security token contract address not configured" }, { status: 500 })
    }

    if (!RPC_URL) {
      return NextResponse.json({ error: "RPC URL not configured" }, { status: 500 })
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(RPC_URL),
    })

    const balance = await publicClient.readContract({
      address: SECURITY_TOKEN_ADDRESS,
      abi: securityABI,
      functionName: "balanceOf",
      args: [address],
    })

    return NextResponse.json({ balance: balance.toString() })
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}