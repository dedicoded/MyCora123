const fs = require("fs")
const path = require("path")

function updateFrontendAddresses() {
  console.log("🔄 Updating server-side contract addresses...")

  const currentNetwork = process.env.NETWORK || "sepolia"
  const envPath = path.join(process.cwd(), ".env.production")

  // Read current environment
  let envContent = ""
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  // Contract addresses are now only accessible server-side through API routes
  const serverOnlyMappings = {
    MCC_CONTRACT_ADDRESS: `${currentNetwork.toUpperCase()}_MYCORA_COIN_ADDRESS`,
    TRUST_TOKEN_ADDRESS: `${currentNetwork.toUpperCase()}_TRUST_TOKEN_ADDRESS`,
    SECURITY_TOKEN_ADDRESS: `${currentNetwork.toUpperCase()}_SECURITY_TOKEN_ADDRESS`,
    UTILITY_TOKEN_ADDRESS: `${currentNetwork.toUpperCase()}_UTILITY_TOKEN_ADDRESS`,
    PUFFPASS_REWARDS_ADDRESS: `${currentNetwork.toUpperCase()}_PUFFPASS_REWARDS_ADDRESS`,
    PAYMENT_PROCESSOR_ADDRESS: `${currentNetwork.toUpperCase()}_PAYMENT_PROCESSOR_ADDRESS`,
    COMPLIANCE_REGISTRY_ADDRESS: `${currentNetwork.toUpperCase()}_COMPLIANCE_REGISTRY_ADDRESS`,
    BADGE_REGISTRY_ADDRESS: `${currentNetwork.toUpperCase()}_BADGE_REGISTRY_ADDRESS`,
    MCC_STAKING_ADDRESS: `${currentNetwork.toUpperCase()}_MCC_STAKING_ADDRESS`,
    FIAT_RAILS_CONTROLLER_ADDRESS: `${currentNetwork.toUpperCase()}_FIAT_RAILS_CONTROLLER_ADDRESS`,
  }

  // Update server-side addresses based on current network
  Object.entries(serverOnlyMappings).forEach(([serverVar, networkVar]) => {
    const networkAddress = process.env[networkVar]
    if (networkAddress && networkAddress !== "0x0000000000000000000000000000000000000000") {
      const regex = new RegExp(`^${serverVar}=.*$`, "m")
      const newLine = `${serverVar}=${networkAddress}`

      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, newLine)
      } else {
        envContent += `\n${newLine}`
      }

      console.log(`✅ Updated ${serverVar} = ${networkAddress}`)
    }
  })

  // Write updated environment
  fs.writeFileSync(envPath, envContent)
  console.log(`📝 Updated .env.production for ${currentNetwork} network`)

  // Contract addresses are no longer exposed to client-side code
  console.log(`🔒 Contract addresses secured on server-side for ${currentNetwork} network`)
  console.log("ℹ️  Frontend components now use API routes to interact with contracts")
}

if (require.main === module) {
  updateFrontendAddresses()
}

module.exports = { updateFrontendAddresses }
