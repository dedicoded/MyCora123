import { Biconomy } from "@biconomy/mexa"
import { ethers } from "ethers"

interface BiconomyConfig {
  apiKey: string
  projectId: string
  bundlerUrl?: string
  originUrl?: string
  debug: boolean
  networkId: number
  walletProvider: any
}

interface GaslessTransactionRequest {
  to: string
  data: string
  from: string
  gasLimit?: string
}

export class GaslessTransactionService {
  private biconomy: any
  private provider: ethers.Provider
  private isInitialized = false

  constructor(config: BiconomyConfig) {
    this.biconomy = new Biconomy(config.walletProvider, {
      apiKey: config.apiKey,
      projectId: config.projectId,
      bundlerUrl: config.bundlerUrl,
      originUrl: config.originUrl,
      debug: config.debug,
      contractAddresses: [
        process.env.SECURITY_TOKEN_ADDRESS,
        process.env.UTILITY_TOKEN_ADDRESS,
        process.env.MCC_CONTRACT_ADDRESS,
        process.env.PUFFPASS_CONTRACT_ADDRESS,
      ],
    })

    this.provider = new ethers.BrowserProvider(this.biconomy)
    this.initializeBiconomy()
  }

  private async initializeBiconomy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.biconomy
        .onEvent(this.biconomy.READY, () => {
          console.log("[v0] Biconomy initialized successfully")
          this.isInitialized = true
          resolve()
        })
        .onEvent(this.biconomy.ERROR, (error: any, message: string) => {
          console.error("[v0] Biconomy initialization error:", error, message)
          reject(new Error(`Biconomy initialization failed: ${message}`))
        })
    })
  }

  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return

    return new Promise((resolve) => {
      const checkInitialization = () => {
        if (this.isInitialized) {
          resolve()
        } else {
          setTimeout(checkInitialization, 100)
        }
      }
      checkInitialization()
    })
  }

  async executeGaslessTransaction(request: GaslessTransactionRequest): Promise<string> {
    await this.waitForInitialization()

    try {
      const signer = this.provider.getSigner()
      const userAddress = await signer.getAddress()

      // Create the transaction
      const tx = {
        to: request.to,
        data: request.data,
        from: userAddress,
        gasLimit: request.gasLimit || "300000",
      }

      // Execute via Biconomy
      const txResponse = await signer.sendTransaction(tx)
      console.log("[v0] Gasless transaction sent:", txResponse.hash)

      return txResponse.hash
    } catch (error) {
      console.error("[v0] Gasless transaction failed:", error)
      throw new Error(`Gasless transaction failed: ${error.message}`)
    }
  }

  async mintTokensGasless(
    contractAddress: string,
    abi: any[],
    functionName: string,
    params: any[],
    userAddress: string,
  ): Promise<string> {
    await this.waitForInitialization()

    const contract = new ethers.Contract(contractAddress, abi, this.provider.getSigner())

    // Encode the function call
    const data = contract.interface.encodeFunctionData(functionName, params)

    return this.executeGaslessTransaction({
      to: contractAddress,
      data,
      from: userAddress,
    })
  }

  async processPaymentGasless(
    paymentProcessorAddress: string,
    payeeAddress: string,
    amount: string,
    reference: string,
    userAddress: string,
  ): Promise<string> {
    await this.waitForInitialization()

    const paymentProcessorABI = [
      "function createPayment(address payee, uint256 amount, string memory reference) external returns (bytes32)",
    ]

    const contract = new ethers.Contract(paymentProcessorAddress, paymentProcessorABI, this.provider.getSigner())

    const data = contract.interface.encodeFunctionData("createPayment", [
      payeeAddress,
      ethers.parseEther(amount),
      reference,
    ])

    return this.executeGaslessTransaction({
      to: paymentProcessorAddress,
      data,
      from: userAddress,
    })
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

// Singleton instance
let gaslessService: GaslessTransactionService | null = null

export function initializeGaslessService(walletProvider: any): GaslessTransactionService {
  if (!gaslessService) {
    const biconomyConfig: BiconomyConfig = {
      apiKey: process.env.BICONOMY_API_KEY!,
      projectId: process.env.BICONOMY_PROJECT_ID!,
      bundlerUrl: process.env.BICONOMY_BUNDLER_URL || "",
      originUrl: process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "https://10ef237c-4d90-4026-9a06-cb1b3ee43a3b-00-1aqa1lbeqtan0.worf.replit.dev:3001",
      debug: process.env.NODE_ENV === "development",
      networkId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1"),
      walletProvider,
    }
    gaslessService = new GaslessTransactionService(biconomyConfig)
  }
  return gaslessService
}

export function getGaslessService(): GaslessTransactionService | null {
  return gaslessService
}