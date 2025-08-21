const fs = require("fs")
const path = require("path")

class EnvironmentValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.success = []
    this.placeholders = [
      "your-api-key",
      "your-project-id",
      "your-secret-key",
      "placeholder",
      "example",
      "0x1234567890123456789012345678901234567890",
      "localhost:3000",
    ]
  }

  // Required environment variables for MyCora platform
  getRequiredVars() {
    return {
      // Core blockchain variables
      DEPLOYER_PRIVATE_KEY: "Private key for contract deployment",
      ETHEREUM_RPC_URL: "Ethereum mainnet RPC endpoint",
      POLYGON_RPC_URL: "Polygon mainnet RPC endpoint",

      // Integration APIs
      CYBRID_API_KEY: "Cybrid API key for fiat rails",
      BICONOMY_API_KEY: "Biconomy API key for gasless transactions",
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: "WalletConnect project ID",

      // Database and storage
      SUPABASE_URL: "Supabase project URL",
      SUPABASE_ANON_KEY: "Supabase anonymous key",

      // Network configuration
      NEXT_PUBLIC_NETWORK: "Target blockchain network (mainnet/polygon/sepolia)",
    }
  }

  // Optional but recommended variables
  getOptionalVars() {
    return {
      ETHERSCAN_API_KEY: "For contract verification",
      POLYGONSCAN_API_KEY: "For Polygon contract verification",
      REPLIT_DB_URL: "For Replit database integration (auto-provided)",
      COMPLIANCE_REGISTRY_API_KEY: "For enhanced compliance features",
    }
  }

  // Contract addresses that should be set after deployment
  getContractAddresses() {
    return {
      MYCORA_COIN_ADDRESS: "MyCora Coin (MCC) contract address",
      TRUST_TOKEN_ADDRESS: "Trust Token contract address",
      PUFFPASS_REWARDS_ADDRESS: "PuffPass rewards contract address",
      PAYMENT_PROCESSOR_ADDRESS: "Payment processor contract address",
      MCC_STAKING_ADDRESS: "MCC staking contract address",
    }
  }

  validateVariable(key, value, description) {
    if (!value) {
      this.errors.push(`❌ ${key}: Missing required variable - ${description}`)
      return false
    }

    // Check for placeholder values
    const isPlaceholder = this.placeholders.some((placeholder) =>
      value.toLowerCase().includes(placeholder.toLowerCase()),
    )

    if (isPlaceholder) {
      this.warnings.push(`⚠️  ${key}: Contains placeholder value "${value}" - ${description}`)
      return false
    }

    // Validate specific formats
    if (key.includes("PRIVATE_KEY") && !value.startsWith("0x") && value.length !== 64) {
      this.warnings.push(`⚠️  ${key}: Invalid private key format`)
      return false
    }

    if (key.includes("RPC_URL") && !value.startsWith("http")) {
      this.warnings.push(`⚠️  ${key}: Invalid RPC URL format`)
      return false
    }

    if (key.includes("ADDRESS") && (!value.startsWith("0x") || value.length !== 42)) {
      this.warnings.push(`⚠️  ${key}: Invalid Ethereum address format`)
      return false
    }

    this.success.push(`✅ ${key}: Valid`)
    return true
  }

  checkEnvironmentFiles() {
    const envFiles = [".env.local", ".env.production", ".env"]
    const foundFiles = envFiles.filter((file) => fs.existsSync(file))

    if (foundFiles.length === 0) {
      this.errors.push("❌ No environment files found (.env.local, .env.production, .env)")
      return false
    }

    console.log(`📁 Found environment files: ${foundFiles.join(", ")}`)
    return true
  }

  validateAll() {
    console.log("🔍 MyCora Environment Validation\n")

    // Check for environment files
    this.checkEnvironmentFiles()

    // Validate required variables
    console.log("📋 Checking Required Variables:")
    const requiredVars = this.getRequiredVars()
    let requiredValid = 0

    Object.entries(requiredVars).forEach(([key, description]) => {
      if (this.validateVariable(key, process.env[key], description)) {
        requiredValid++
      }
    })

    // Validate optional variables
    console.log("\n📋 Checking Optional Variables:")
    const optionalVars = this.getOptionalVars()
    let optionalValid = 0

    Object.entries(optionalVars).forEach(([key, description]) => {
      if (process.env[key]) {
        if (this.validateVariable(key, process.env[key], description)) {
          optionalValid++
        }
      } else {
        console.log(`ℹ️  ${key}: Not set (optional) - ${description}`)
      }
    })

    // Validate contract addresses
    console.log("\n📋 Checking Contract Addresses:")
    const contractAddresses = this.getContractAddresses()
    let contractsValid = 0

    Object.entries(contractAddresses).forEach(([key, description]) => {
      if (process.env[key]) {
        if (this.validateVariable(key, process.env[key], description)) {
          contractsValid++
        }
      } else {
        this.warnings.push(`⚠️  ${key}: Not deployed yet - ${description}`)
      }
    })

    // Print results
    this.printResults(requiredValid, optionalValid, contractsValid, requiredVars, optionalVars, contractAddresses)

    return this.errors.length === 0
  }

  printResults(requiredValid, optionalValid, contractsValid, requiredVars, optionalVars, contractAddresses) {
    console.log("\n" + "=".repeat(60))
    console.log("📊 VALIDATION SUMMARY")
    console.log("=".repeat(60))

    // Success summary
    console.log(`✅ Required Variables: ${requiredValid}/${Object.keys(requiredVars).length}`)
    console.log(`✅ Optional Variables: ${optionalValid}/${Object.keys(optionalVars).length}`)
    console.log(`✅ Contract Addresses: ${contractsValid}/${Object.keys(contractAddresses).length}`)

    // Print all messages
    if (this.success.length > 0) {
      console.log("\n🎉 Valid Configuration:")
      this.success.forEach((msg) => console.log(`  ${msg}`))
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:")
      this.warnings.forEach((msg) => console.log(`  ${msg}`))
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:")
      this.errors.forEach((msg) => console.log(`  ${msg}`))
    }

    // Production readiness score
    const totalVars = Object.keys(requiredVars).length + Object.keys(contractAddresses).length
    const validVars = requiredValid + contractsValid
    const readinessScore = Math.round((validVars / totalVars) * 100)

    console.log("\n" + "=".repeat(60))
    console.log(`🎯 PRODUCTION READINESS: ${readinessScore}%`)
    console.log("=".repeat(60))

    if (readinessScore >= 90) {
      console.log("🚀 Ready for production deployment!")
    } else if (readinessScore >= 70) {
      console.log("⚡ Almost ready - fix warnings for production")
    } else {
      console.log("🔧 Requires configuration before deployment")
    }

    // Next steps
    console.log("\n📋 Next Steps:")
    if (this.errors.length > 0) {
      console.log("1. Fix all error conditions above")
    }
    if (contractsValid === 0) {
      console.log("2. Deploy contracts using: npm run deploy:sepolia")
    }
    if (this.warnings.length > 0) {
      console.log("3. Address warnings for production readiness")
    }
    console.log("4. Deploy on Replit: Your app will auto-deploy when you save changes")
  }
}

// Run validation
const validator = new EnvironmentValidator()
const isValid = validator.validateAll()

// Exit with appropriate code for CI/CD
process.exit(isValid ? 0 : 1)
