import { type NextRequest, NextResponse } from "next/server"
import { CybridService } from "@/lib/cybrid-integration"
import { ethers } from "ethers"

const cybrid = new CybridService()

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, mccAmount, cybridCustomerId } = await request.json()

    // Validate inputs
    if (!walletAddress || !mccAmount || !cybridCustomerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const customerStatus = await cybrid.getCustomerStatus(cybridCustomerId)

    if (customerStatus.type !== "business" && customerStatus.state !== "verified") {
      return NextResponse.json({ error: "Off-ramp restricted to verified business accounts" }, { status: 403 })
    }

    const quote = await cybrid.createMCCToFiatQuote(cybridCustomerId, mccAmount)

    const { transactionId, fiatAmount } = await cybrid.executeFiatWithdrawal(
      cybridCustomerId,
      quote.guid,
      walletAddress,
    )

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const wallet = new ethers.Wallet(process.env.MCC_MINTER_PRIVATE_KEY!, provider)

    const mccContract = new ethers.Contract(
      process.env.MCC_CONTRACT_ADDRESS!,
      ["function burnForFiat(address from, uint256 amount, string memory cybridTxId) external"],
      wallet,
    )

    const burnTx = await mccContract.burnForFiat(walletAddress, ethers.parseEther(mccAmount), transactionId)

    await burnTx.wait()

    return NextResponse.json({
      success: true,
      transactionId,
      fiatAmount,
      blockchainTxHash: burnTx.hash,
    })
  } catch (error) {
    console.error("[v0] MCC burning error:", error)
    return NextResponse.json({ error: "Failed to burn MCC tokens" }, { status: 500 })
  }
}
