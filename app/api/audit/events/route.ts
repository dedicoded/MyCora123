import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("type")
    const userAddress = searchParams.get("address")
    const fromBlock = searchParams.get("fromBlock") || "latest"

    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)

    // Define contract addresses and ABIs for event filtering
    const contracts = {
      mcc: {
        address: process.env.MCC_CONTRACT_ADDRESS,
        abi: [
          "event Transfer(address indexed from, address indexed to, uint256 value)",
          "event Mint(address indexed to, uint256 amount)",
          "event Burn(address indexed from, uint256 amount)",
        ],
      },
      staking: {
        address: process.env.MCC_STAKING_CONTRACT_ADDRESS,
        abi: [
          "event Staked(address indexed user, uint256 amount, uint256 lockPeriod)",
          "event Unstaked(address indexed user, uint256 amount)",
        ],
      },
      puffpass: {
        address: process.env.PUFFPASS_CONTRACT_ADDRESS,
        abi: [
          "event PassMinted(address indexed user, uint256 tier, uint256 purchaseCount)",
          "event TierUpgraded(address indexed user, uint256 newTier)",
        ],
      },
    }

    const events: any[] = []

    for (const [contractName, contractInfo] of Object.entries(contracts)) {
      if (eventType && contractName !== eventType) continue

      const contract = new ethers.Contract(contractInfo.address!, contractInfo.abi, provider)

      try {
        const contractEvents = await contract.queryFilter(
          "*", // All events
          fromBlock === "latest" ? -1000 : Number.parseInt(fromBlock), // Last 1000 blocks or specified
          "latest",
        )

        const filteredEvents = contractEvents
          .filter((event) => {
            if (userAddress) {
              // Filter events related to specific user address
              return event.args?.some(
                (arg: any) => typeof arg === "string" && arg.toLowerCase() === userAddress.toLowerCase(),
              )
            }
            return true
          })
          .map((event) => ({
            contract: contractName,
            event: event.eventName,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: null, // Will be populated below
            args: event.args
              ? Object.keys(event.args).reduce((acc, key) => {
                  if (isNaN(Number(key))) {
                    acc[key] = event.args![key].toString()
                  }
                  return acc
                }, {} as any)
              : {},
          }))

        events.push(...filteredEvents)
      } catch (error) {
        console.error(`Error fetching events for ${contractName}:`, error)
      }
    }

    const eventsWithTimestamps = await Promise.all(
      events.map(async (event) => {
        try {
          const block = await provider.getBlock(event.blockNumber)
          return {
            ...event,
            timestamp: block?.timestamp ? new Date(block.timestamp * 1000).toISOString() : null,
          }
        } catch (error) {
          return { ...event, timestamp: null }
        }
      }),
    )

    // Sort by block number (most recent first)
    eventsWithTimestamps.sort((a, b) => b.blockNumber - a.blockNumber)

    return NextResponse.json({
      success: true,
      events: eventsWithTimestamps.slice(0, 100), // Limit to 100 most recent events
      total: eventsWithTimestamps.length,
    })
  } catch (error) {
    console.error("Audit trail error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch audit events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { events, snapshotId } = await request.json()

    // Create audit snapshot
    const snapshot = {
      id: snapshotId || `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventCount: events.length,
      events: events,
      hash: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(events))),
    }

    // In production, this would upload to IPFS/Arweave
    // For now, we'll simulate the process
    const ipfsHash = `Qm${ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(snapshot))).slice(2, 48)}`

    // Log the snapshot creation
    console.log(`[v0] Audit snapshot created: ${snapshot.id}`)
    console.log(`[v0] IPFS hash: ${ipfsHash}`)

    return NextResponse.json({
      success: true,
      snapshot: {
        ...snapshot,
        ipfsHash,
      },
    })
  } catch (error) {
    console.error("Audit snapshot error:", error)
    return NextResponse.json({ success: false, error: "Failed to create audit snapshot" }, { status: 500 })
  }
}
