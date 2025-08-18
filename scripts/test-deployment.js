const https = require("https")
const fs = require("fs")

async function testDeployment() {
  console.log("🚀 Testing MyCora Deployment...\n")

  const results = {
    apiRoutes: {},
    environmentVars: {},
    frontendIntegration: {},
    overall: "PENDING",
  }

  // Test API Routes
  console.log("📡 Testing API Routes...")
  const apiRoutes = [
    "/api/verify-license",
    "/api/whitelist",
    "/api/gasless/mint",
    "/api/gasless/payment",
    "/api/mcc/mint",
    "/api/mcc/stake",
    "/api/compliance/kyc",
    "/api/payments/create",
    "/api/rewards/purchase",
  ]

  for (const route of apiRoutes) {
    try {
      const response = await testApiRoute(route)
      results.apiRoutes[route] = {
        status: response.status,
        accessible: response.status !== 404,
        responseTime: response.responseTime,
      }
      console.log(`  ✅ ${route}: ${response.status} (${response.responseTime}ms)`)
    } catch (error) {
      results.apiRoutes[route] = {
        status: "ERROR",
        accessible: false,
        error: error.message,
      }
      console.log(`  ❌ ${route}: ERROR - ${error.message}`)
    }
  }

  // Test Environment Variables
  console.log("\n🔧 Checking Environment Variables...")
  const requiredEnvVars = [
    "DEPLOYER_PRIVATE_KEY",
    "ETHEREUM_RPC_URL",
    "POLYGON_RPC_URL",
    "BICONOMY_API_KEY",
    "CYBRID_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ]

  for (const envVar of requiredEnvVars) {
    const isSet = process.env[envVar] ? true : false
    results.environmentVars[envVar] = isSet
    console.log(`  ${isSet ? "✅" : "❌"} ${envVar}: ${isSet ? "SET" : "MISSING"}`)
  }

  // Test Frontend Integration
  console.log("\n🎨 Testing Frontend Integration...")
  try {
    const homepageResponse = await testApiRoute("/")
    results.frontendIntegration.homepage = {
      accessible: homepageResponse.status === 200,
      status: homepageResponse.status,
    }
    console.log(`  ✅ Homepage: ${homepageResponse.status}`)
  } catch (error) {
    results.frontendIntegration.homepage = {
      accessible: false,
      error: error.message,
    }
    console.log(`  ❌ Homepage: ERROR - ${error.message}`)
  }

  // Generate Overall Status
  const apiSuccess = Object.values(results.apiRoutes).filter((r) => r.accessible).length
  const envSuccess = Object.values(results.environmentVars).filter((v) => v).length
  const frontendSuccess = results.frontendIntegration.homepage?.accessible ? 1 : 0

  const totalTests = apiRoutes.length + requiredEnvVars.length + 1
  const passedTests = apiSuccess + envSuccess + frontendSuccess
  const successRate = (passedTests / totalTests) * 100

  if (successRate >= 80) {
    results.overall = "PRODUCTION_READY"
  } else if (successRate >= 60) {
    results.overall = "NEEDS_ATTENTION"
  } else {
    results.overall = "DEPLOYMENT_ISSUES"
  }

  // Generate Report
  console.log("\n📊 Deployment Test Summary")
  console.log("================================")
  console.log(`Overall Status: ${results.overall}`)
  console.log(`Success Rate: ${successRate.toFixed(1)}%`)
  console.log(`API Routes: ${apiSuccess}/${apiRoutes.length} accessible`)
  console.log(`Environment Variables: ${envSuccess}/${requiredEnvVars.length} set`)
  console.log(`Frontend: ${frontendSuccess}/1 accessible`)

  // Save detailed results
  fs.writeFileSync("deployment-test-results.json", JSON.stringify(results, null, 2))
  console.log("\n💾 Detailed results saved to deployment-test-results.json")

  // Recommendations
  console.log("\n💡 Next Steps:")
  if (results.overall === "PRODUCTION_READY") {
    console.log("  🎉 Deployment is production-ready!")
    console.log("  • Test user flows manually")
    console.log("  • Monitor error logs")
    console.log("  • Set up monitoring alerts")
  } else {
    console.log("  🔧 Issues to address:")
    if (apiSuccess < apiRoutes.length) {
      console.log("  • Fix failing API routes")
    }
    if (envSuccess < requiredEnvVars.length) {
      console.log("  • Set missing environment variables in Vercel")
    }
    if (!frontendSuccess) {
      console.log("  • Fix frontend accessibility issues")
    }
  }

  return results
}

async function testApiRoute(path) {
  const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"
  const url = `${baseUrl}${path}`

  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const request = https.get(url, (response) => {
      const responseTime = Date.now() - startTime
      resolve({
        status: response.statusCode,
        responseTime,
      })
    })

    request.on("error", (error) => {
      reject(error)
    })

    request.setTimeout(10000, () => {
      request.destroy()
      reject(new Error("Request timeout"))
    })
  })
}

// Run tests if called directly
if (require.main === module) {
  testDeployment().catch(console.error)
}

module.exports = { testDeployment }
