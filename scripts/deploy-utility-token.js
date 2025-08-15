const { ethers } = require("hardhat")
const hre = require("hardhat") // Declare hre variable

async function main() {
  console.log("🚀 Deploying MyCora Utility Token...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy Utility Token
  const UtilityToken = await ethers.getContractFactory("MyCoraUtilityToken")
  const utilityToken = await UtilityToken.deploy(
    "MyCora Utility Token",
    "MCUT",
    deployer.address, // Initial owner
  )

  await utilityToken.deployed()

  console.log("✅ Utility Token deployed to:", utilityToken.address)
  console.log("📋 Transaction hash:", utilityToken.deployTransaction.hash)

  console.log("\n📝 Add this to your Vercel environment variables:")
  console.log(`UTILITY_TOKEN_ADDRESS=${utilityToken.address}`)
  console.log(`UTILITY_TOKEN_CHAIN_ID=${hre.network.config.chainId || 1}`)

  if (hre.network.name === "polygon") {
    console.log(`UTILITY_TOKEN_CHAIN_ID=137`)
  } else if (hre.network.name === "base") {
    console.log(`UTILITY_TOKEN_CHAIN_ID=8453`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
