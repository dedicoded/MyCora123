import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { address, signature } = await request.json()

    if (!address || !signature) {
      return NextResponse.json({ error: "Address and signature required" }, { status: 400 })
    }

    const isValid = address.length === 42 && signature.length > 0

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: { address },
      token: "mock-jwt-token", // Replace with actual JWT generation
    })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
