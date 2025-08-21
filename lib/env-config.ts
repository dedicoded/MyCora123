// Environment configuration and validation
export const isReplit = Boolean(process.env.REPLIT_DB_URL);

export const getEnvMessage = () =>
  isReplit
    ? "Missing Replit Secrets. Please configure your environment variables in Replit."
    : "Missing environment variables. Please configure your deployment.";

export const envConfig = {
  // Blockchain Configuration
  alchemyRpcUrl: process.env.ALCHEMY_RPC_URL,
  ethRpcUrl: process.env.ETH_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  ethPrivateKey: process.env.ETH_PRIVATE_KEY,

  // Contract Addresses
  securityTokenAddress: process.env.SECURITY_TOKEN_ADDRESS,
  utilityTokenAddress: process.env.UTILITY_TOKEN_ADDRESS,
  mccContractAddress: process.env.MCC_CONTRACT_ADDRESS,
  mccStakingContractAddress: process.env.MCC_STAKING_CONTRACT_ADDRESS,
  puffpassContractAddress: process.env.PUFFPASS_CONTRACT_ADDRESS,
  paymentProcessorContractAddress: process.env.PAYMENT_PROCESSOR_CONTRACT_ADDRESS,
  complianceRegistryAddress: process.env.COMPLIANCE_REGISTRY_ADDRESS,
  fiatRailsContractAddress: process.env.FIAT_RAILS_CONTRACT_ADDRESS,

  // IPFS Storage
  web3StorageToken: process.env.WEB3_STORAGE_TOKEN,

  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  isReplit: Boolean(process.env.REPL_ID || process.env.REPLIT_DB_URL),
  replId: process.env.REPL_ID,

  // Helper functions
  isProduction: () => process.env.NODE_ENV === "production",
  isDevelopment: () => process.env.NODE_ENV === "development",
  isReplitEnvironment: () => Boolean(process.env.REPL_ID || process.env.REPLIT_DB_URL),

  validateRequired: () => {
    const requiredContracts = [
      { key: "MCC_CONTRACT_ADDRESS", purpose: "MyCora Coin stablecoin contract" },
      { key: "MCC_STAKING_CONTRACT_ADDRESS", purpose: "MCC staking rewards contract" },
      { key: "SECURITY_TOKEN_ADDRESS", purpose: "security token contract" },
      { key: "UTILITY_TOKEN_ADDRESS", purpose: "utility token contract" },
      { key: "PUFFPASS_CONTRACT_ADDRESS", purpose: "PuffPass loyalty NFT contract" },
      { key: "PAYMENT_PROCESSOR_CONTRACT_ADDRESS", purpose: "payment processing contract" },
      { key: "COMPLIANCE_REGISTRY_ADDRESS", purpose: "KYC/AML compliance contract" },
      { key: "FIAT_RAILS_CONTRACT_ADDRESS", purpose: "fiat locking mechanism contract" },
    ]

    const requiredRpc = [{ key: "ALCHEMY_RPC_URL", purpose: "blockchain RPC connection" }]

    const missing = [...requiredContracts, ...requiredRpc].filter(({ key }) => !process.env[key])
    const placeholders = requiredContracts.filter(({ key }) => {
      const value = process.env[key]
      return value && (value.includes("0x...") || value.includes("1234567890") || value.length !== 42)
    })

    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables:`)
      missing.forEach(({ key, purpose }) => {
        console.error(`   - ${key} (needed for ${purpose})`)
      })
      console.error(`\n💡 Add these to Replit Secrets:`)
      console.error(`   1. Click the lock icon (🔒) in your Replit sidebar`)
      console.error(`   2. Add each missing variable as a new secret`)
      console.error(`   3. Restart your development server`)
    }

    if (placeholders.length > 0) {
      console.error(`❌ Placeholder contract addresses detected:`)
      placeholders.forEach(({ key, purpose }) => {
        console.error(`   - ${key} contains placeholder address (needed for ${purpose})`)
      })
      console.error(`\n💡 Deploy contracts first: npm run deploy:sepolia`)
    }

    return missing.length === 0 && placeholders.length === 0
  },

  validateContractAddresses: () => {
    const addresses = [
      process.env.MCC_CONTRACT_ADDRESS,
      process.env.SECURITY_TOKEN_ADDRESS,
      process.env.UTILITY_TOKEN_ADDRESS,
      process.env.PUFFPASS_CONTRACT_ADDRESS,
      process.env.PAYMENT_PROCESSOR_CONTRACT_ADDRESS,
    ].filter(Boolean)

    const invalidAddresses = addresses.filter(
      (addr) => !addr.startsWith("0x") || addr.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(addr),
    )

    if (invalidAddresses.length > 0) {
      console.error(`❌ Invalid contract address format:`, invalidAddresses)
      return false
    }

    console.log(`✅ All contract addresses have valid format`)
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