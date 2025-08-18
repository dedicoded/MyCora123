import { ethers } from "hardhat"
import fs from "fs"
import path from "path"
import hre from "hardhat"

interface DeploymentResult {
  contractName: string
  address: string
  network: string
  txHash: string
  verified: boolean
}

interface DeploymentMetadata {
  timestamp: string
  network: string
  contracts: DeploymentResult[]
}

function parseArgs() {
  const args = process.argv.slice(2)
  return {
    verifyOnly: args.includes("--verify-only"),
    dryRun: args.includes("--dry-run"),
    network: args.find((arg) => arg.startsWith("--network="))?.split("=")[1] || "hardhat",
  }
}

function validateNetwork(networkName: string) {
  const supportedNetworks = ["mainnet", "sepolia", "goerli", "polygon", "base", "optimism", "arbitrum"]
  if (!supportedNetworks.includes(networkName) && networkName !== "hardhat") {
    throw new Error(`❌ Unsupported network: ${networkName}. Supported: ${supportedNetworks.join(", ")}`)
  }
}

async function deployAllContracts() {
  const network = await ethers.provider.getNetwork()
  const networkName = network.name

  validateNetwork(networkName)

  const deployments: DeploymentResult[] = []

  console.log(`🚀 Deploying all MyCora contracts to ${networkName}...`)

  try {
    // 1. Deploy MyCoraCoin (MCC) - USD-pegged stablecoin
    console.log("📄 Deploying MyCoraCoin...")
    const MCCFactory = await ethers.getContractFactory("MyCoraCoin")
    const mcc = await MCCFactory.deploy()
    await mcc.waitForDeployment()
    deployments.push({
      contractName: "MyCoraCoin",
      address: await mcc.getAddress(),
      network: networkName,
      txHash: mcc.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 2. Deploy ComplianceRegistry
    console.log("📄 Deploying ComplianceRegistry...")
    const ComplianceFactory = await ethers.getContractFactory("ComplianceRegistry")
    const compliance = await ComplianceFactory.deploy()
    await compliance.waitForDeployment()
    deployments.push({
      contractName: "ComplianceRegistry",
      address: await compliance.getAddress(),
      network: networkName,
      txHash: compliance.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 3. Deploy TrustToken
    console.log("📄 Deploying TrustToken...")
    const TrustFactory = await ethers.getContractFactory("TrustToken")
    const trust = await TrustFactory.deploy(await compliance.getAddress())
    await trust.waitForDeployment()
    deployments.push({
      contractName: "TrustToken",
      address: await trust.getAddress(),
      network: networkName,
      txHash: trust.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 4. Deploy PaymentProcessor
    console.log("📄 Deploying PaymentProcessor...")
    const PaymentFactory = await ethers.getContractFactory("PaymentProcessor")
    const payment = await PaymentFactory.deploy(await mcc.getAddress())
    await payment.waitForDeployment()
    deployments.push({
      contractName: "PaymentProcessor",
      address: await payment.getAddress(),
      network: networkName,
      txHash: payment.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 5. Deploy PuffPassRewards
    console.log("📄 Deploying PuffPassRewards...")
    const PuffPassFactory = await ethers.getContractFactory("PuffPassRewards")
    const puffpass = await PuffPassFactory.deploy()
    await puffpass.waitForDeployment()
    deployments.push({
      contractName: "PuffPassRewards",
      address: await puffpass.getAddress(),
      network: networkName,
      txHash: puffpass.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 6. Deploy MCCStaking
    console.log("📄 Deploying MCCStaking...")
    const StakingFactory = await ethers.getContractFactory("MCCStaking")
    const staking = await StakingFactory.deploy(await mcc.getAddress())
    await staking.waitForDeployment()
    deployments.push({
      contractName: "MCCStaking",
      address: await staking.getAddress(),
      network: networkName,
      txHash: staking.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 7. Deploy BadgeRegistry
    console.log("📄 Deploying BadgeRegistry...")
    const BadgeFactory = await ethers.getContractFactory("BadgeRegistry")
    const badge = await BadgeFactory.deploy()
    await badge.waitForDeployment()
    deployments.push({
      contractName: "BadgeRegistry",
      address: await badge.getAddress(),
      network: networkName,
      txHash: badge.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 8. Deploy FiatRailsController
    console.log("📄 Deploying FiatRailsController...")
    const FiatFactory = await ethers.getContractFactory("FiatRailsController")
    const fiat = await FiatFactory.deploy(await mcc.getAddress())
    await fiat.waitForDeployment()
    deployments.push({
      contractName: "FiatRailsController",
      address: await fiat.getAddress(),
      network: networkName,
      txHash: fiat.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 9. Deploy MyCoraSecurityToken
    console.log("📄 Deploying MyCoraSecurityToken...")
    const SecurityFactory = await ethers.getContractFactory("MyCoraSecurityToken")
    const security = await SecurityFactory.deploy("MyCora Security Token", "MCST", await compliance.getAddress())
    await security.waitForDeployment()
    deployments.push({
      contractName: "MyCoraSecurityToken",
      address: await security.getAddress(),
      network: networkName,
      txHash: security.deploymentTransaction()?.hash || "",
      verified: false,
    })

    // 10. Deploy MyCoraUtilityToken
    console.log("📄 Deploying MyCoraUtilityToken...")
    const UtilityFactory = await ethers.getContractFactory("MyCoraUtilityToken")
    const utility = await UtilityFactory.deploy()
    await utility.waitForDeployment()
    deployments.push({
      contractName: "MyCoraUtilityToken",
      address: await utility.getAddress(),
      network: networkName,
      txHash: utility.deploymentTransaction()?.hash || "",
      verified: false,
    })

    const deploymentMetadata: DeploymentMetadata = {
      timestamp: new Date().toISOString(),
      network: networkName,
      contracts: deployments,
    }

    const deploymentFile = path.join(__dirname, `../deployments/${networkName}-deployments.json`)
    fs.mkdirSync(path.dirname(deploymentFile), { recursive: true })
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentMetadata, null, 2))

    const envOutput = deployments
      .map((d) => {
        const envName =
          d.contractName
            .toUpperCase()
            .replace(/([A-Z])/g, "_$1")
            .substring(1) + "_ADDRESS"
        return `${envName}=${d.address}`
      })
      .join("\n")

    const envFile = path.join(__dirname, "../.env.production")
    fs.writeFileSync(envFile, `# MyCora Contract Addresses - Generated ${new Date().toISOString()}\n${envOutput}`)
    console.log("📄 .env.production file generated.")

    console.log("\n📊 Deployment Summary:")
    console.table(
      deployments.map((d) => ({
        Contract: d.contractName,
        Address: d.address,
        TxHash: d.txHash.substring(0, 10) + "...",
        Verified: d.verified ? "✅" : "❌",
      })),
    )

    console.log("\n✅ All contracts deployed successfully!")
    console.log(`📁 Deployment details saved to: ${deploymentFile}`)

    return deployments
  } catch (error) {
    console.error("❌ Deployment failed:", error)
    throw error
  }
}

async function verifyContracts(deployments: DeploymentResult[]) {
  console.log("\n🔍 Verifying contracts on Etherscan...")

  for (const deployment of deployments) {
    try {
      console.log(`Verifying ${deployment.contractName}...`)

      // Get constructor arguments based on contract
      const constructorArgs = getConstructorArgs(deployment.contractName, deployments)

      await hre.run("verify:verify", {
        address: deployment.address,
        constructorArguments: constructorArgs,
      })

      deployment.verified = true
      console.log(`✅ ${deployment.contractName} verified`)
    } catch (error) {
      console.error(`❌ Failed to verify ${deployment.contractName}:`, error)
    }
  }
}

function getConstructorArgs(contractName: string, deployments: DeploymentResult[]): any[] {
  const getAddress = (name: string) => deployments.find((d) => d.contractName === name)?.address || ""

  switch (contractName) {
    case "TrustToken":
      return [getAddress("ComplianceRegistry")]
    case "PaymentProcessor":
    case "MCCStaking":
    case "FiatRailsController":
      return [getAddress("MyCoraCoin")]
    case "MyCoraSecurityToken":
      return ["MyCora Security Token", "MCST", getAddress("ComplianceRegistry")]
    default:
      return []
  }
}

async function main() {
  const args = parseArgs()

  if (args.verifyOnly) {
    const networkName = (await ethers.provider.getNetwork()).name
    const deploymentFile = path.join(__dirname, `../deployments/${networkName}-deployments.json`)

    if (!fs.existsSync(deploymentFile)) {
      throw new Error(`No deployment file found for ${networkName}`)
    }

    const metadata: DeploymentMetadata = JSON.parse(fs.readFileSync(deploymentFile, "utf8"))
    await verifyContracts(metadata.contracts)
    return
  }

  if (args.dryRun) {
    console.log("🧪 Dry run mode - contracts will not be deployed")
    return
  }

  const deployments = await deployAllContracts()
  await verifyContracts(deployments)
}

if (require.main === module) {
  main().catch(console.error)
}

export { deployAllContracts, verifyContracts }
