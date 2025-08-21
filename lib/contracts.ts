import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"

// Contract addresses from environment variables
const SECURITY_TOKEN_ADDRESS = process.env.SECURITY_TOKEN_ADDRESS as `0x${string}`
const UTILITY_TOKEN_ADDRESS = process.env.UTILITY_TOKEN_ADDRESS as `0x${string}`

// Enhanced RPC configuration with Reown Blockchain API
const REOWN_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL
const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "1" ? mainnet : sepolia

// Configure RPC with fallback to Reown Blockchain API
const getRpcUrl = () => {
  if (ALCHEMY_RPC_URL) return ALCHEMY_RPC_URL
  
  // Fallback to Reown Blockchain API
  const chainId = chain.id
  return `https://rpc.reown.com/v1/?chainId=eip155:${chainId}&projectId=${REOWN_PROJECT_ID}`
}

// Create clients with enhanced configuration
export const publicClient = createPublicClient({
  chain,
  transport: http(getRpcUrl(), {
    // Add retry logic and batch requests
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
})

// Contract interaction functions
export async function getContractAddresses() {
  // This will be called from server-side API routes only
  return {
    securityToken: SECURITY_TOKEN_ADDRESS,
    utilityToken: UTILITY_TOKEN_ADDRESS,
  }
}

export async function getTokenBalance(address: `0x${string}`) {
  try {
    // Call server-side API route instead of direct contract interaction
    const response = await fetch("/api/token-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
    const data = await response.json()
    return data.balance || 0n
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return 0n
  }
}

export async function getTokenMetadata(tokenId: bigint) {
  try {
    // Call server-side API route instead of direct contract interaction
    const response = await fetch("/api/token-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: tokenId.toString() }),
    })
    const data = await response.json()
    return data.tokenURI || null
  } catch (error) {
    console.error("Error fetching token metadata:", error)
    return null
  }
}
