import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function POST(request: NextRequest) {
  try {
    const { userAddress, payeeAddress, amount, currency, reference } = await request.json()

    // Validate inputs
    if (!userAddress || !payeeAddress || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate Ethereum addresses
    if (!ethers.isAddress(userAddress) || !ethers.isAddress(payeeAddress)) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 })
    }

    // Get PaymentProcessor contract details
    const contractAddress = process.env.PAYMENT_PROCESSOR_CONTRACT_ADDRESS!
    const abi = [
      "function createPayment(address payee, uint256 amount, string memory reference) external returns (bytes32)",
    ]

    // Prepare transaction data
    const contract = new ethers.Interface(abi)
    const data = contract.encodeFunctionData("createPayment", [
      payeeAddress,
      ethers.parseEther(amount.toString()),
      reference || "",
    ])

    // Return transaction data for gasless execution
    return NextResponse.json({
      success: true,
      transactionData: {
        to: contractAddress,
        data,
        from: userAddress,
        gasLimit: "400000",
      },
      paymentDetails: {
        payee: payeeAddress,
        amount,
        currency: currency || "ETH",
        reference,
      },
      message: "Gasless payment prepared successfully",
    })
  } catch (error) {
    console.error("[v0] Gasless payment preparation error:", error)
    return NextResponse.json({ error: "Failed to prepare gasless payment" }, { status: 500 })
  }
}
