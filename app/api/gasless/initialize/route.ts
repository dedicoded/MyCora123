import { type NextRequest, NextResponse } from "next/server"
import { GaslessTransactionService } from "@/lib/gasless-transactions"

export async function POST(request: Request) {
  try {
    // Validate origin for MEE security
    const origin = request.headers.get('origin') || request.headers.get('referer')
    const allowedOrigins = [
      'https://10ef237c-4d90-4026-9a06-cb1b3ee43a3b-00-1aqa1lbeqtan0.worf.replit.dev:3001',
      'https://10ef237c-4d90-4026-9a06-cb1b3ee43a3b-00-1aqa1lbeqtan0.worf.replit.dev',
      process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null
    ].filter(Boolean)

    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return Response.json({ error: 'Origin not allowed' }, { status: 403 })
    }

    const { userAddress, chainId } = await request.json()

    const gaslessService = new GaslessTransactionService({
      apiKey: process.env.BICONOMY_API_KEY!,
      debug: process.env.NODE_ENV === "development",
      networkId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1"),
      walletProvider: null, // Will be set by client
    })

    return NextResponse.json({
      success: true,
      message: "Gasless service initialized",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize gasless service" }, { status: 500 })
  }
}