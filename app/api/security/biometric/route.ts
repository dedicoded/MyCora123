import { type NextRequest, NextResponse } from "next/server"
import { securityEngine } from "@/lib/security-engine"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, biometricData } = await request.json()

    if (!sessionId || !biometricData) {
      return NextResponse.json({ error: "Session ID and biometric data required" }, { status: 400 })
    }

    const result = await securityEngine.verifyBiometric(sessionId, biometricData)

    return NextResponse.json({
      success: true,
      verified: result.verified,
      confidence: result.confidence,
      flags: result.flags,
      message: result.verified ? "Biometric verification successful" : "Biometric verification failed",
    })
  } catch (error) {
    console.error("[v0] Biometric verification error:", error)
    return NextResponse.json({ error: "Biometric verification failed" }, { status: 500 })
  }
}
