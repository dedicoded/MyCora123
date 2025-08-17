import { type NextRequest, NextResponse } from "next/server"
import { CybridService } from "@/lib/cybrid-integration"
import { ethers } from "ethers"

const cybrid = new CybridService()

export async function POST(request: NextRequest) {
  try {
    const { email, name, fiatAmount, walletAddress } = await request.json()

    // Validate inputs
    if (!email || !name || !fiatAmount || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (fiatAmount <= 0) {
      return NextResponse.json({ error: "Fiat amount must be positive" }, { status: 400 })
    }

    let customer
    try {
      customer = await cybrid.createCustomer(email, name)
    } catch (error) {
      console.error("[v0] Cybrid customer creation failed:", error)
      return NextResponse.json({ error: "Failed to create customer account" }, { status: 500 })
    }

    const quote = await cybrid.createFiatToMCCQuote(customer.guid, fiatAmount)

    const { transactionId, mccAmount } = await cybrid.executeFiatDeposit(customer.guid, quote.guid, walletAddress)

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const wallet = new ethers.Wallet(process.env.MCC_MINTER_PRIVATE_KEY!, provider)

    const mccContract = new ethers.Contract(
      process.env.MCC_CONTRACT_ADDRESS!,
      [
        "function mintFromFiat(address to, uint256 amount, string memory cybridTxId) external",
        "function linkCybridAccount(address wallet, string memory accountId) external",
      ],
      wallet,
    )

    // Link wallet to Cybrid account
    await mccContract.linkCybridAccount(walletAddress, customer.guid)

    // Mint the tokens
    const mintTx = await mccContract.mintFromFiat(walletAddress, ethers.parseEther(mccAmount), transactionId)

    await mintTx.wait()

    return NextResponse.json({
      success: true,
      transactionId,
      mccAmount,
      cybridCustomerId: customer.guid,
      blockchainTxHash: mintTx.hash,
    })
  } catch (error) {
    console.error("[v0] MCC minting error:", error)
    return NextResponse.json({ error: "Failed to mint MCC tokens" }, { status: 500 })
  }
}
