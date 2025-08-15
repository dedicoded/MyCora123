import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { address, action } = await request.json()

    // Validate input
    if (!address || !action) {
      return NextResponse.json({ error: "Missing required fields: address, action" }, { status: 400 })
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
    }

    // Mock whitelist management
    // In production, this would interact with your database or smart contract
    const isWhitelisted = Math.random() > 0.5 // Mock random result

    return NextResponse.json({
      success: true,
      address,
      action,
      isWhitelisted,
      message: `Address ${action === "add" ? "added to" : "removed from"} whitelist`,
    })
  } catch (error) {
    console.error("Whitelist error:", error)
    return NextResponse.json({ error: "Internal server error during whitelist operation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    // Mock whitelist check
    const isWhitelisted = Math.random() > 0.5

    return NextResponse.json({
      address,
      isWhitelisted,
      message: `Address is ${isWhitelisted ? "" : "not "}whitelisted`,
    })
  } catch (error) {
    console.error("Whitelist check error:", error)
    return NextResponse.json({ error: "Internal server error during whitelist check" }, { status: 500 })
  }
}
