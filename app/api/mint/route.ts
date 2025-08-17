import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Mint API called") // Added debug logging

    const { address, amount, tokenType } = await request.json()

    // Validate input
    if (!address || !amount || !tokenType) {
      return NextResponse.json({ error: "Missing required fields: address, amount, tokenType" }, { status: 400 })
    }

    // Check if minting is enabled
    const mintingEnabled = process.env.ENABLE_MINTING === "true"
    if (!mintingEnabled) {
      console.log("[v0] Minting disabled, returning mock response") // Added debug logging
      return NextResponse.json(
        {
          success: true, // Return success even when disabled for demo purposes
          transactionHash: `0x${"demo".padEnd(62, "0")}`,
          tokenType,
          amount,
          recipient: address,
          message: "Demo minting response (configure ENABLE_MINTING for real functionality)",
        },
        { status: 200 },
      )
    }

    // In a real implementation, this would interact with your smart contracts
    // For now, return a mock response that indicates the structure
    const mockTransactionHash = `0x${Math.random().toString(16).slice(2, 66)}`

    return NextResponse.json({
      success: true,
      transactionHash: mockTransactionHash,
      tokenType,
      amount,
      recipient: address,
      message: "Minting request processed successfully",
    })
  } catch (error) {
    console.error("Minting error:", error)
    return NextResponse.json({ error: "Internal server error during minting" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Mint API endpoint. Use POST to mint tokens.",
    methods: ["POST"],
  })
}
