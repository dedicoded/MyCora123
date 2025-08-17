import { type NextRequest, NextResponse } from "next/server"

interface KYCRequest {
  address: string
  kycLevel: number
  jurisdictions: string[]
  documentHash?: string
  providerId?: string
}

interface KYCResponse {
  success: boolean
  address: string
  kycLevel: number
  isCompliant: boolean
  approvedJurisdictions: string[]
  riskScore: number
  lastUpdated: string
  expiresAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { address, kycLevel, jurisdictions, documentHash, providerId }: KYCRequest = await request.json()

    // Validate input
    if (!address || kycLevel === undefined || !jurisdictions?.length) {
      return NextResponse.json({ error: "Missing required fields: address, kycLevel, jurisdictions" }, { status: 400 })
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
    }

    // Validate KYC level
    if (kycLevel < 0 || kycLevel > 3) {
      return NextResponse.json({ error: "KYC level must be between 0-3" }, { status: 400 })
    }

    // Calculate risk score based on KYC level and jurisdictions
    const riskScore = calculateRiskScore(kycLevel, jurisdictions)

    // Set compliance status
    const isCompliant = kycLevel >= 1 && riskScore <= 70

    // Calculate expiration (KYC expires after 1 year)
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    // Log compliance event for audit trail
    await logComplianceEvent({
      eventType: "KYC_UPDATE",
      address,
      kycLevel,
      jurisdictions,
      riskScore,
      providerId,
      timestamp: new Date().toISOString(),
    })

    const response: KYCResponse = {
      success: true,
      address,
      kycLevel,
      isCompliant,
      approvedJurisdictions: jurisdictions,
      riskScore,
      lastUpdated: new Date().toISOString(),
      expiresAt,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] KYC processing error:", error)
    return NextResponse.json({ error: "KYC processing failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const jurisdiction = searchParams.get("jurisdiction")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    // Mock KYC status retrieval
    const mockKYCData: KYCResponse = {
      success: true,
      address,
      kycLevel: 2,
      isCompliant: true,
      approvedJurisdictions: ["US", "EU"],
      riskScore: 25,
      lastUpdated: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    }

    // Check jurisdiction-specific compliance if requested
    if (jurisdiction && !mockKYCData.approvedJurisdictions.includes(jurisdiction)) {
      return NextResponse.json({
        ...mockKYCData,
        isCompliant: false,
        message: `Not compliant in jurisdiction: ${jurisdiction}`,
      })
    }

    return NextResponse.json(mockKYCData)
  } catch (error) {
    console.error("[v0] KYC retrieval error:", error)
    return NextResponse.json({ error: "KYC retrieval failed" }, { status: 500 })
  }
}

function calculateRiskScore(kycLevel: number, jurisdictions: string[]): number {
  let baseScore = 100 - kycLevel * 25 // Higher KYC level = lower risk

  // Adjust for jurisdiction risk
  const highRiskJurisdictions = ["CN", "RU", "IR", "KP"]
  const hasHighRiskJurisdiction = jurisdictions.some((j) => highRiskJurisdictions.includes(j))

  if (hasHighRiskJurisdiction) {
    baseScore += 30
  }

  return Math.max(0, Math.min(100, baseScore))
}

async function logComplianceEvent(event: any) {
  // In production, this would write to a secure audit log
  console.log("[v0] Compliance Event:", JSON.stringify(event, null, 2))
}
