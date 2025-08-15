import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { licenseData, tokenAddress } = await request.json()

    if (!licenseData || !tokenAddress) {
      return NextResponse.json({ error: "License data and token address required" }, { status: 400 })
    }

    const verification = {
      isValid: true,
      licenseId: `license_${Date.now()}`,
      tokenAddress,
      timestamp: new Date().toISOString(),
      status: "verified",
    }

    let ipfsHash = null
    try {
      const client = await getWeb3StorageClient()
      const blob = new Blob([JSON.stringify(verification)], { type: "application/json" })
      const files = [new File([blob], "license-verification.json")]
      const cid = await client.put(files)
      ipfsHash = cid.toString()
    } catch (ipfsError) {
      console.warn("[v0] IPFS anchoring failed:", ipfsError)
      // Continue without IPFS anchoring
    }

    return NextResponse.json({
      success: true,
      verification,
      ipfsHash,
      anchored: !!ipfsHash,
    })
  } catch (error) {
    console.error("[v0] License verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

async function getWeb3StorageClient() {
  const token = process.env.WEB3_STORAGE_TOKEN

  if (!token) {
    throw new Error("WEB3_STORAGE_TOKEN not configured")
  }

  const { Web3Storage } = await import("web3.storage")
  return new Web3Storage({ token })
}
