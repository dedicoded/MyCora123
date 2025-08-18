import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function POST(request: NextRequest) {
  try {
    const { userAddress, tokenType, amount, metadataURI } = await request.json()

    // Validate inputs
    if (!userAddress || !tokenType || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate Ethereum address
    if (!ethers.isAddress(userAddress)) {
      return NextResponse.json({ error: "Invalid user address" }, { status: 400 })
    }

    // Get contract details based on token type
    let contractAddress: string
    let abi: any[]
    let functionName: string
    let params: any[]

    switch (tokenType) {
      case "security":
        contractAddress = process.env.SECURITY_TOKEN_ADDRESS!
        abi = [
          "function mint(address to, uint256 amount) external",
          "function isWhitelisted(address user) external view returns (bool)",
        ]
        functionName = "mint"
        params = [userAddress, ethers.parseEther(amount.toString())]
        break

      case "utility":
        contractAddress = process.env.UTILITY_TOKEN_ADDRESS!
        abi = ["function mint(address to, string memory metadataURI) external returns (uint256)"]
        functionName = "mint"
        params = [userAddress, metadataURI || ""]
        break

      case "mcc":
        contractAddress = process.env.MCC_CONTRACT_ADDRESS!
        abi = ["function mintFromFiat(address to, uint256 amount, string memory cybridTxId) external"]
        functionName = "mintFromFiat"
        params = [userAddress, ethers.parseEther(amount.toString()), `gasless_${Date.now()}`]
        break

      case "puffpass":
        contractAddress = process.env.PUFFPASS_CONTRACT_ADDRESS!
        abi = ["function mintPass(address to, uint256 purchaseCount) external"]
        functionName = "mintPass"
        params = [userAddress, amount]
        break

      default:
        return NextResponse.json({ error: "Invalid token type" }, { status: 400 })
    }

    // Prepare gasless transaction data
    const contract = new ethers.Interface(abi)
    const data = contract.encodeFunctionData(functionName, params)

    // Return transaction data for frontend to execute via Biconomy
    return NextResponse.json({
      success: true,
      transactionData: {
        to: contractAddress,
        data,
        from: userAddress,
        gasLimit: "300000",
      },
      tokenType,
      amount,
      recipient: userAddress,
      message: "Gasless transaction prepared successfully",
    })
  } catch (error) {
    console.error("[v0] Gasless mint preparation error:", error)
    return NextResponse.json({ error: "Failed to prepare gasless transaction" }, { status: 500 })
  }
}
