const { ethers } = require("ethers")
require("dotenv").config()

// Contract addresses to validate
const CONTRACTS = {
  MYCORA_COIN: process.env.MYCORA_COIN_ADDRESS,
  TRUST_TOKEN: process.env.TRUST_TOKEN_ADDRESS,
  SECURITY_TOKEN: process.env.SECURITY_TOKEN_ADDRESS,
  UTILITY_TOKEN: process.env.UTILITY_TOKEN_ADDRESS,
  PUFFPASS_REWARDS: process.env.PUFFPASS_REWARDS_ADDRESS,
  COMPLIANCE_REGISTRY: process.env.COMPLIANCE_REGISTRY_ADDRESS,
  PAYMENT_PROCESSOR: process.env.PAYMENT_PROCESSOR_ADDRESS,
  BADGE_REGISTRY: process.env.BADGE_REGISTRY_ADDRESS,
  MCC_STAKING: process.env.MCC_STAKING_ADDRESS,
  FIAT_RAILS_CONTROLLER: process.env.FIAT_RAILS_CONTROLLER_ADDRESS,
}

// Network configurations
const NETWORKS = {
  mainnet: {
    rpc: process.env.ETHEREUM_RPC_URL,
    chainId: 1,
    name: "Ethereum Mainnet",
  },
  sepolia: {
    rpc: process.env.SEPOLIA_RPC_URL,
    chainId: 11155111,
    name: "Sepolia Testnet",
  },
  polygon: {
    rpc: process.env.POLYGON_RPC_URL,
    chainId: 137,
    name: "Polygon Mainnet",
  },
}

async function validateAddress(address, contractName, provider) {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return { valid: false, error: "Address not set or zero address" }
  }

  if (!ethers.utils.isAddress(address)) {
    return { valid: false, error: "Invalid address format" }
  }

  try {
    const code = await provider.getCode(address)
    if (code === "0x") {
      return { valid: false, error: "No contract code at address" }
    }

    return { valid: true, codeSize: code.length }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

async function runValidation() {
  console.log("🔍 Starting MyCora Contract Address Validation\n")

  const network = process.env.NETWORK || "sepolia"
  const networkConfig = NETWORKS[network]

  if (!networkConfig) {
    console.error(`❌ Unknown network: ${network}`)
    process.exit(1)
  }

  if (!networkConfig.rpc) {
    console.error(`❌ RPC URL not configured for ${network}`)
    process.exit(1)
  }

  console.log(`🌐 Network: ${networkConfig.name}`)
  console.log(`🔗 RPC: ${networkConfig.rpc}\n`)

  const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc)

  let validCount = 0
  let totalCount = 0

  console.log("📋 Contract Validation Results:")
  console.log("─".repeat(80))

  for (const [name, address] of Object.entries(CONTRACTS)) {
    totalCount++
    const result = await validateAddress(address, name, provider)

    if (result.valid) {
      validCount++
      console.log(`✅ ${name.padEnd(25)} ${address} (${result.codeSize} bytes)`)
    } else {
      console.log(`❌ ${name.padEnd(25)} ${address || "NOT_SET"} - ${result.error}`)
    }
  }

  console.log("─".repeat(80))
  console.log(`📊 Summary: ${validCount}/${totalCount} contracts valid`)

  const readinessScore = Math.round((validCount / totalCount) * 100)
  console.log(`🎯 Production Readiness: ${readinessScore}%`)

  if (readinessScore < 80) {
    console.log("\n⚠️  Production readiness below 80%. Deploy missing contracts before going live.")
    process.exit(1)
  } else {
    console.log("\n🚀 System ready for production deployment!")
  }
}

// Run validation if called directly
if (require.main === module) {
  runValidation().catch(console.error)
}

module.exports = { runValidation, validateAddress }
