import { ethers } from "hardhat"
import { getPuffPassTier } from "../lib/puffpass-tier-logic"

async function main() {
  const recipient = process.env.MINT_TO!
  const purchaseCount = Number.parseInt(process.env.PURCHASE_COUNT!)

  if (!recipient || isNaN(purchaseCount)) {
    console.error("Please set MINT_TO and PURCHASE_COUNT environment variables")
    process.exit(1)
  }

  const contractAddress = process.env.PUFFPASS_CONTRACT_ADDRESS!
  if (!contractAddress) {
    console.error("Please set PUFFPASS_CONTRACT_ADDRESS environment variable")
    process.exit(1)
  }

  const PuffPass = await ethers.getContractFactory("PuffPass")
  const contract = PuffPass.attach(contractAddress)

  const { tokenId, uri, tier, benefits } = getPuffPassTier(purchaseCount)

  if (tokenId === 0) {
    console.log(`No tier unlocked for ${purchaseCount} purchases. Need at least 3 purchases.`)
    return
  }

  console.log(`Minting ${tier} PuffPass (Token ID: ${tokenId}) to ${recipient}`)
  console.log(`Benefits: ${benefits.join(", ")}`)

  const tx = await contract.mint(recipient, tokenId, uri)
  await tx.wait()

  console.log(`✅ Successfully minted ${tier} PuffPass!`)
  console.log(`Transaction hash: ${tx.hash}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
