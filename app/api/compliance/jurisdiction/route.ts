import { type NextRequest, NextResponse } from "next/server"

interface JurisdictionRule {
  code: string
  name: string
  isSupported: boolean
  kycRequirements: {
    minimumLevel: number
    requiredDocuments: string[]
    enhancedDueDiligence: boolean
  }
  transactionLimits: {
    daily: number
    monthly: number
    annual: number
  }
  restrictions: string[]
  complianceFramework: string
}

const JURISDICTION_RULES: Record<string, JurisdictionRule> = {
  US: {
    code: "US",
    name: "United States",
    isSupported: true,
    kycRequirements: {
      minimumLevel: 2,
      requiredDocuments: ["government_id", "proof_of_address", "ssn"],
      enhancedDueDiligence: true,
    },
    transactionLimits: {
      daily: 100000,
      monthly: 500000,
      annual: 2000000,
    },
    restrictions: ["no_anonymous_transactions", "aml_monitoring"],
    complianceFramework: "BSA/AML",
  },
  EU: {
    code: "EU",
    name: "European Union",
    isSupported: true,
    kycRequirements: {
      minimumLevel: 2,
      requiredDocuments: ["government_id", "proof_of_address"],
      enhancedDueDiligence: true,
    },
    transactionLimits: {
      daily: 75000,
      monthly: 300000,
      annual: 1500000,
    },
    restrictions: ["gdpr_compliance", "mifid_ii"],
    complianceFramework: "5AMLD",
  },
  UK: {
    code: "UK",
    name: "United Kingdom",
    isSupported: true,
    kycRequirements: {
      minimumLevel: 2,
      requiredDocuments: ["government_id", "proof_of_address"],
      enhancedDueDiligence: true,
    },
    transactionLimits: {
      daily: 80000,
      monthly: 400000,
      annual: 1800000,
    },
    restrictions: ["fca_compliance"],
    complianceFramework: "MLR2017",
  },
  SG: {
    code: "SG",
    name: "Singapore",
    isSupported: true,
    kycRequirements: {
      minimumLevel: 1,
      requiredDocuments: ["government_id"],
      enhancedDueDiligence: false,
    },
    transactionLimits: {
      daily: 50000,
      monthly: 200000,
      annual: 1000000,
    },
    restrictions: ["mas_compliance"],
    complianceFramework: "PSAA",
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jurisdictionCode = searchParams.get("code")
    const address = searchParams.get("address")

    if (jurisdictionCode) {
      // Get specific jurisdiction rules
      const jurisdiction = JURISDICTION_RULES[jurisdictionCode.toUpperCase()]
      if (!jurisdiction) {
        return NextResponse.json({ error: "Jurisdiction not found" }, { status: 404 })
      }

      // If address provided, check compliance for that address in this jurisdiction
      if (address) {
        const complianceCheck = await checkJurisdictionCompliance(address, jurisdictionCode)
        return NextResponse.json({
          jurisdiction,
          address,
          compliance: complianceCheck,
        })
      }

      return NextResponse.json({ jurisdiction })
    }

    // Return all supported jurisdictions
    const supportedJurisdictions = Object.values(JURISDICTION_RULES).filter((j) => j.isSupported)

    return NextResponse.json({
      success: true,
      jurisdictions: supportedJurisdictions,
      total: supportedJurisdictions.length,
    })
  } catch (error) {
    console.error("[v0] Jurisdiction query error:", error)
    return NextResponse.json({ error: "Jurisdiction query failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, jurisdictions } = await request.json()

    if (!address || !jurisdictions?.length) {
      return NextResponse.json({ error: "Missing required fields: address, jurisdictions" }, { status: 400 })
    }

    // Check compliance for each jurisdiction
    const complianceResults = await Promise.all(
      jurisdictions.map(async (code: string) => {
        const compliance = await checkJurisdictionCompliance(address, code)
        return {
          jurisdiction: code,
          ...compliance,
        }
      }),
    )

    // Log jurisdiction compliance check
    await logComplianceEvent({
      eventType: "JURISDICTION_CHECK",
      address,
      jurisdictions,
      results: complianceResults,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      address,
      complianceResults,
      overallCompliant: complianceResults.every((r) => r.isCompliant),
    })
  } catch (error) {
    console.error("[v0] Jurisdiction compliance check error:", error)
    return NextResponse.json({ error: "Jurisdiction compliance check failed" }, { status: 500 })
  }
}

async function checkJurisdictionCompliance(address: string, jurisdictionCode: string) {
  const jurisdiction = JURISDICTION_RULES[jurisdictionCode.toUpperCase()]
  if (!jurisdiction) {
    return {
      isCompliant: false,
      reason: "Jurisdiction not supported",
      requirements: [],
    }
  }

  // Mock KYC level check (in production, query from ComplianceRegistry)
  const userKYCLevel = 2 // Mock user KYC level
  const meetsKYCRequirement = userKYCLevel >= jurisdiction.kycRequirements.minimumLevel

  // Mock document verification
  const hasRequiredDocuments = true // Mock document check

  // Check transaction limits (mock recent transaction volume)
  const recentTransactionVolume = 25000 // Mock volume
  const withinLimits = recentTransactionVolume <= jurisdiction.transactionLimits.daily

  const isCompliant = meetsKYCRequirement && hasRequiredDocuments && withinLimits

  const requirements = []
  if (!meetsKYCRequirement) {
    requirements.push(`KYC level ${jurisdiction.kycRequirements.minimumLevel} required`)
  }
  if (!hasRequiredDocuments) {
    requirements.push(`Required documents: ${jurisdiction.kycRequirements.requiredDocuments.join(", ")}`)
  }
  if (!withinLimits) {
    requirements.push(`Transaction volume exceeds daily limit of ${jurisdiction.transactionLimits.daily}`)
  }

  return {
    isCompliant,
    kycLevel: userKYCLevel,
    meetsKYCRequirement,
    hasRequiredDocuments,
    withinLimits,
    requirements,
    transactionLimits: jurisdiction.transactionLimits,
    restrictions: jurisdiction.restrictions,
  }
}

async function logComplianceEvent(event: any) {
  console.log("[v0] Compliance Event:", JSON.stringify(event, null, 2))
}
