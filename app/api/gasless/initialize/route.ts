import { type NextRequest, NextResponse } from "next/server"
import { GaslessTransactionService } from "@/lib/gasless-transactions"

export async function POST(request: NextRequest) {
  try {
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
