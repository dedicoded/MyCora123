import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deploying PuffPass with:", deployer.address)

  const PuffPass = await ethers.getContractFactory("PuffPass")
  const contract = await PuffPass.deploy("ipfs://placeholder/")
  await contract.deployed()

  console.log("PuffPass deployed to:", contract.address)

  console.log("\nAdd this to your .env file:")
  console.log(`PUFFPASS_CONTRACT_ADDRESS=${contract.address}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
