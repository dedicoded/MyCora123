import { type NextRequest, NextResponse } from "next/server"
import { securityEngine } from "@/lib/security-engine"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, code, method } = await request.json()

    if (!sessionId || !code || !method) {
      return NextResponse.json({ error: "Session ID, code, and method required" }, { status: 400 })
    }

    const isValid = await securityEngine.verifyMFA(sessionId, code, method)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "MFA verification successful",
    })
  } catch (error) {
    console.error("[v0] MFA verification error:", error)
    return NextResponse.json({ error: "MFA verification failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Generate QR code for TOTP setup
    const secret = generateTOTPSecret()
    const qrCodeUrl = `otpauth://totp/MyCora:${userId}?secret=${secret}&issuer=MyCora`

    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl,
      backupCodes: generateBackupCodes(),
    })
  } catch (error) {
    console.error("[v0] MFA setup error:", error)
    return NextResponse.json({ error: "MFA setup failed" }, { status: 500 })
  }
}

function generateTOTPSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let secret = ""
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
  }
  return codes
}