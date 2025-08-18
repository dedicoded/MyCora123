const fs = require("fs")
const path = require("path")

class DeploymentVerifier {
  constructor() {
    this.errors = []
    this.warnings = []
    this.info = []
  }

  log(level, message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`

    if (level === "error") {
      this.errors.push(message)
      console.error(`❌ ${logMessage}`)
    } else if (level === "warning") {
      this.warnings.push(message)
      console.warn(`⚠️  ${logMessage}`)
    } else {
      this.info.push(message)
      console.log(`ℹ️  ${logMessage}`)
    }
  }

  checkFileExists(filePath, required = true) {
    const fullPath = path.join(process.cwd(), filePath)
    const exists = fs.existsSync(fullPath)

    if (!exists && required) {
      this.log("error", `Required file missing: ${filePath}`)
    } else if (!exists) {
      this.log("warning", `Optional file missing: ${filePath}`)
    } else {
      this.log("info", `File found: ${filePath}`)
    }

    return exists
  }

  checkEnvironmentVariables() {
    this.log("info", "Checking environment variables...")

    const requiredVars = [
      "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
      "NEXT_PUBLIC_MCC_CONTRACT_ADDRESS",
      "NEXT_PUBLIC_NETWORK",
    ]

    const optionalVars = [
      "TRUST_TOKEN_ADDRESS",
      "SECURITY_TOKEN_ADDRESS",
      "UTILITY_TOKEN_ADDRESS",
      "BICONOMY_API_KEY",
      "CYBRID_API_KEY",
    ]

    let missingRequired = 0
    let missingOptional = 0

    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        this.log("error", `Missing required environment variable: ${varName}`)
        missingRequired++
      } else {
        this.log("info", `Environment variable configured: ${varName}`)
      }
    })

    optionalVars.forEach((varName) => {
      if (!process.env[varName]) {
        this.log("warning", `Missing optional environment variable: ${varName}`)
        missingOptional++
      } else {
        this.log("info", `Environment variable configured: ${varName}`)
      }
    })

    return { missingRequired, missingOptional }
  }

  checkComponentImports() {
    this.log("info", "Checking component imports...")

    const mainPagePath = "app/page.tsx"
    if (!this.checkFileExists(mainPagePath)) {
      return false
    }

    const pageContent = fs.readFileSync(path.join(process.cwd(), mainPagePath), "utf8")

    const requiredComponents = [
      "WalletConnect",
      "MintingInterface",
      "SecurityVerification",
      "RewardsDashboard",
      "PaymentForm",
    ]

    const requiredUIComponents = ["TrustIndicator", "ComplianceBadge", "NetworkNode"]

    let missingComponents = 0

    requiredComponents.forEach((component) => {
      if (!pageContent.includes(component)) {
        this.log("error", `Missing component import: ${component}`)
        missingComponents++
      } else {
        this.log("info", `Component imported: ${component}`)
      }
    })

    requiredUIComponents.forEach((component) => {
      if (!pageContent.includes(component)) {
        this.log("warning", `Missing UI component: ${component}`)
      } else {
        this.log("info", `UI component imported: ${component}`)
      }
    })

    return missingComponents === 0
  }

  checkBuildConfiguration() {
    this.log("info", "Checking build configuration...")

    // Check package.json
    if (!this.checkFileExists("package.json")) {
      return false
    }

    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"))

    if (!packageJson.scripts?.build) {
      this.log("error", "Missing build script in package.json")
      return false
    }

    if (!packageJson.scripts?.start) {
      this.log("error", "Missing start script in package.json")
      return false
    }

    this.log("info", "Build scripts configured correctly")

    // Check Next.js config
    const nextConfigExists =
      this.checkFileExists("next.config.js", false) || this.checkFileExists("next.config.mjs", false)

    if (!nextConfigExists) {
      this.log("warning", "No Next.js config file found")
    }

    return true
  }

  checkAssets() {
    this.log("info", "Checking static assets...")

    const assetPaths = ["public", "app/globals.css"]

    let missingAssets = 0

    assetPaths.forEach((assetPath) => {
      if (!this.checkFileExists(assetPath, false)) {
        missingAssets++
      }
    })

    return missingAssets === 0
  }

  generateReport() {
    console.log("\n" + "=".repeat(60))
    console.log("🚀 MYCORA DEPLOYMENT VERIFICATION REPORT")
    console.log("=".repeat(60))

    const envCheck = this.checkEnvironmentVariables()
    const componentCheck = this.checkComponentImports()
    const buildCheck = this.checkBuildConfiguration()
    const assetCheck = this.checkAssets()

    console.log("\n📊 SUMMARY:")
    console.log(`✅ Errors: ${this.errors.length}`)
    console.log(`⚠️  Warnings: ${this.warnings.length}`)
    console.log(`ℹ️  Info: ${this.info.length}`)

    console.log("\n🎯 DEPLOYMENT READINESS:")

    let score = 100
    score -= this.errors.length * 20
    score -= this.warnings.length * 5
    score = Math.max(0, score)

    if (score >= 90) {
      console.log(`🟢 EXCELLENT (${score}%) - Ready for production deployment`)
    } else if (score >= 70) {
      console.log(`🟡 GOOD (${score}%) - Minor issues to address`)
    } else if (score >= 50) {
      console.log(`🟠 FAIR (${score}%) - Several issues need attention`)
    } else {
      console.log(`🔴 POOR (${score}%) - Critical issues must be fixed`)
    }

    if (this.errors.length > 0) {
      console.log("\n❌ CRITICAL ISSUES TO FIX:")
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS TO CONSIDER:")
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`)
      })
    }

    console.log("\n🔧 NEXT STEPS:")
    if (this.errors.length > 0) {
      console.log("1. Fix all critical errors listed above")
      console.log("2. Configure missing environment variables in Vercel")
      console.log("3. Re-run this verification script")
    } else if (this.warnings.length > 0) {
      console.log("1. Consider addressing warnings for optimal performance")
      console.log("2. Test deployment in staging environment")
    } else {
      console.log("1. Deploy to production - all checks passed!")
      console.log("2. Monitor deployment logs for any runtime issues")
    }

    console.log("\n" + "=".repeat(60))

    return {
      score,
      errors: this.errors.length,
      warnings: this.warnings.length,
      ready: this.errors.length === 0,
    }
  }
}

// Run verification
const verifier = new DeploymentVerifier()
const result = verifier.generateReport()

process.exit(result.ready ? 0 : 1)
