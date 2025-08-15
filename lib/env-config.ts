// Environment variable configuration and validation
export const envConfig = {
  // Blockchain Configuration
  alchemyRpcUrl: process.env.ALCHEMY_RPC_URL,
  ethRpcUrl: process.env.ETH_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  ethPrivateKey: process.env.ETH_PRIVATE_KEY,

  // Contract Addresses
  securityTokenAddress: process.env.SECURITY_TOKEN_ADDRESS,
  utilityTokenAddress: process.env.UTILITY_TOKEN_ADDRESS,

  // IPFS Storage
  web3StorageToken: process.env.WEB3_STORAGE_TOKEN,

  // Environment
  nodeEnv: process.env.NODE_ENV || "development",

  // Helper functions
  isProduction: () => process.env.NODE_ENV === "production",
  isDevelopment: () => process.env.NODE_ENV === "development",

  validateRequired: () => {
    const required = [
      { key: "ALCHEMY_RPC_URL", purpose: "blockchain RPC connection" },
      { key: "SECURITY_TOKEN_ADDRESS", purpose: "security token contract" },
      { key: "UTILITY_TOKEN_ADDRESS", purpose: "utility token contract" },
    ]

    const missing = required.filter(({ key }) => !process.env[key])
    const optional = [
      { key: "WEB3_STORAGE_TOKEN", purpose: "IPFS uploads (will use fallback)" },
      { key: "PRIVATE_KEY", purpose: "contract interactions (read-only mode)" },
    ]

    const missingOptional = optional.filter(({ key }) => !process.env[key])

    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables:`)
      missing.forEach(({ key, purpose }) => {
        console.error(`   - ${key} (needed for ${purpose})`)
      })
      return false
    }

    if (missingOptional.length > 0) {
      console.warn(`⚠️  Missing optional environment variables:`)
      missingOptional.forEach(({ key, purpose }) => {
        console.warn(`   - ${key} (${purpose})`)
      })
    }

    console.log(`✅ Environment configuration validated successfully`)
    return true
  },

  validateNetwork: () => {
    const rpcUrl = process.env.ALCHEMY_RPC_URL || process.env.ETH_RPC_URL
    if (!rpcUrl) return false

    const isMainnet = rpcUrl.includes("mainnet")
    const isTestnet = rpcUrl.includes("goerli") || rpcUrl.includes("sepolia")

    if (!isMainnet && !isTestnet) {
      console.warn(`⚠️  Unknown network in RPC URL: ${rpcUrl}`)
    }

    return true
  },
}
