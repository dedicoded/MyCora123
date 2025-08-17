import { type NextRequest, NextResponse } from "next/server"
import { SecurityEngine, defaultSecurityConfig } from "@/lib/security-engine"

const securityEngine = new SecurityEngine(defaultSecurityConfig)

export async function POST(request: NextRequest) {
  try {
    const { userId, deviceInfo, ipAddress, location } = await request.json()

    if (!userId || !deviceInfo) {
      return NextResponse.json({ error: "User ID and device info required" }, { status: 400 })
    }

    const session = await securityEngine.createSecureSession({
      userId,
      deviceInfo,
      ipAddress: ipAddress || request.ip || "unknown",
      location: location || { country: "US", city: "Unknown" },
    })

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        riskScore: session.riskScore,
        requiresMFA: session.riskScore > 30,
        requiresBiometric: session.riskScore > 50,
        expiresAt: session.expiresAt,
      },
    })
  } catch (error) {
    console.error("[v0] Session creation error:", error)
    return NextResponse.json({ error: "Session creation failed" }, { status: 500 })
  }
}
