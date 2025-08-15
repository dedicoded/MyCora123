const { ethers } = require("hardhat")
const hre = require("hardhat") // Declare hre variable

async function main() {
  console.log("🚀 Deploying MyCora Security Token...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Deploy Security Token
  const SecurityToken = await ethers.getContractFactory("MyCoraSecurityToken")
  const securityToken = await SecurityToken.deploy(
    "MyCora Security Token",
    "MCST",
    deployer.address, // Initial owner
  )

  await securityToken.deployed()

  console.log("✅ Security Token deployed to:", securityToken.address)
  console.log("📋 Transaction hash:", securityToken.deployTransaction.hash)

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: securityToken.address,
    transactionHash: securityToken.deployTransaction.hash,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  }

  console.log("\n📝 Add this to your Vercel environment variables (SERVER-SIDE ONLY):")
  console.log(`SECURITY_TOKEN_ADDRESS=${securityToken.address}`)

  if (hre.network.name === "mainnet") {
    console.log(`NEXT_PUBLIC_SECURITY_CHAIN_ID=1`)
  } else if (hre.network.name === "sepolia") {
    console.log(`NEXT_PUBLIC_SECURITY_CHAIN_ID=11155111`)
  }

  console.log("\n⚠️  IMPORTANT: Contract addresses should NOT be exposed client-side")
  console.log("   Use server-side API routes to interact with contracts")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
