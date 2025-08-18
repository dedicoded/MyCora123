const https = require("https")
require("dotenv").config()

const VERCEL_API_URL = "https://api.vercel.com"
const PROJECT_ID = process.env.VERCEL_PROJECT_ID
const AUTH_TOKEN = process.env.VERCEL_TOKEN

// Environment variables to sync
const ENV_VARS_TO_SYNC = [
  "MYCORA_COIN_ADDRESS",
  "TRUST_TOKEN_ADDRESS",
  "SECURITY_TOKEN_ADDRESS",
  "UTILITY_TOKEN_ADDRESS",
  "PUFFPASS_REWARDS_ADDRESS",
  "COMPLIANCE_REGISTRY_ADDRESS",
  "PAYMENT_PROCESSOR_ADDRESS",
  "BADGE_REGISTRY_ADDRESS",
  "MCC_STAKING_ADDRESS",
  "FIAT_RAILS_CONTROLLER_ADDRESS",
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
  "BICONOMY_API_KEY",
  "CYBRID_API_KEY",
  "PRIVY_APP_ID",
  "PRIVY_APP_SECRET",
]

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vercel.com",
      path: path,
      method: method,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    }

    const req = https.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body)
          resolve(parsed)
        } catch (e) {
          resolve(body)
        }
      })
    })

    req.on("error", reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function syncEnvironmentVariables() {
  console.log("🔄 Syncing Environment Variables to Vercel\n")

  if (!PROJECT_ID) {
    console.error("❌ VERCEL_PROJECT_ID not set")
    process.exit(1)
  }

  if (!AUTH_TOKEN) {
    console.error("❌ VERCEL_TOKEN not set")
    process.exit(1)
  }

  console.log(`📦 Project ID: ${PROJECT_ID}`)
  console.log(`🔑 Variables to sync: ${ENV_VARS_TO_SYNC.length}\n`)

  let syncedCount = 0
  let skippedCount = 0

  for (const envVar of ENV_VARS_TO_SYNC) {
    const value = process.env[envVar]

    if (!value) {
      console.log(`⏭️  ${envVar.padEnd(35)} - SKIPPED (not set locally)`)
      skippedCount++
      continue
    }

    try {
      const response = await makeRequest("POST", `/v9/projects/${PROJECT_ID}/env`, {
        key: envVar,
        value: value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      })

      if (response.error) {
        console.log(`❌ ${envVar.padEnd(35)} - ERROR: ${response.error.message}`)
      } else {
        console.log(`✅ ${envVar.padEnd(35)} - SYNCED`)
        syncedCount++
      }
    } catch (error) {
      console.log(`❌ ${envVar.padEnd(35)} - ERROR: ${error.message}`)
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log("\n" + "─".repeat(60))
  console.log(`📊 Summary: ${syncedCount} synced, ${skippedCount} skipped`)
  console.log("🚀 Environment variables updated in Vercel!")
}

// Run sync if called directly
if (require.main === module) {
  syncEnvironmentVariables().catch(console.error)
}

module.exports = { syncEnvironmentVariables }
