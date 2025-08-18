const { ethers } = require("ethers")
require("dotenv").config()

// Import other validation functions
const { validateAddress } = require("./validate-addresses")

async function validateProduction() {
  console.log("🔍 MyCora Production Readiness Validation\n")

  let score = 0
  let maxScore = 0
  const results = []

  // 1. Environment Variables Check (20 points)
  maxScore += 20
  const requiredEnvVars = [
    "ETHEREUM_RPC_URL",
    "SEPOLIA_RPC_URL",
    "DEPLOYER_PRIVATE_KEY",
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
    "MYCORA_COIN_ADDRESS",
    "TRUST_TOKEN_ADDRESS",
  ]

  let envScore = 0
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      envScore += 20 / requiredEnvVars.length
    }
  }
  score += envScore
  results.push(`Environment Variables: ${Math.round(envScore)}/20`)

  // 2. Contract Deployment Check (30 points)
  maxScore += 30
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)

  const contracts = [
    process.env.MYCORA_COIN_ADDRESS,
    process.env.TRUST_TOKEN_ADDRESS,
    process.env.SECURITY_TOKEN_ADDRESS,
    process.env.PUFFPASS_REWARDS_ADDRESS,
  ]

  let contractScore = 0
  for (const address of contracts) {
    if (address) {
      const result = await validateAddress(address, "contract", provider)
      if (result.valid) {
        contractScore += 30 / contracts.length
      }
    }
  }
  score += contractScore
  results.push(`Contract Deployment: ${Math.round(contractScore)}/30`)

  // 3. Network Configuration (20 points)
  maxScore += 20
  let networkScore = 0
  if (process.env.ETHEREUM_RPC_URL) networkScore += 10
  if (process.env.SEPOLIA_RPC_URL) networkScore += 10
  score += networkScore
  results.push(`Network Configuration: ${networkScore}/20`)

  // 4. Security Configuration (15 points)
  maxScore += 15
  let securityScore = 0
  if (process.env.DEPLOYER_PRIVATE_KEY) securityScore += 7
  if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) securityScore += 8
  score += securityScore
  results.push(`Security Configuration: ${securityScore}/15`)

  // 5. Integration APIs (15 points)
  maxScore += 15
  let apiScore = 0
  if (process.env.CYBRID_API_KEY) apiScore += 5
  if (process.env.BICONOMY_API_KEY) apiScore += 5
  if (process.env.PRIVY_APP_ID) apiScore += 5
  score += apiScore
  results.push(`Integration APIs: ${apiScore}/15`)

  // Display Results
  console.log("📊 Production Readiness Report:")
  console.log("─".repeat(50))

  results.forEach((result) => console.log(`  ${result}`))

  console.log("─".repeat(50))
  const finalScore = Math.round((score / maxScore) * 100)
  console.log(`🎯 Overall Score: ${finalScore}%`)

  if (finalScore >= 85) {
    console.log("🚀 READY FOR PRODUCTION!")
  } else if (finalScore >= 70) {
    console.log("⚠️  STAGING READY - Some production features missing")
  } else {
    console.log("❌ NOT READY - Critical components missing")
  }

  return finalScore
}

// Run validation if called directly
if (require.main === module) {
  validateProduction().catch(console.error)
}

module.exports = { validateProduction }
