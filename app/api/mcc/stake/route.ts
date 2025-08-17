import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

const STAKING_CONTRACT_ABI = [
  "function stake(uint256 amount, uint256 lockPeriod) external",
  "function unstake() external",
  "function claimRewards() external",
  "function getStakeInfo(address user) external view returns (tuple(uint256 amount, uint256 startTime, uint256 lastRewardTime, uint256 accumulatedRewards, uint256 lockPeriod), uint256 pendingRewards)",
  "function calculateRewards(address user) external view returns (uint256)",
]

export async function POST(request: NextRequest) {
  try {
    const { action, userAddress, amount, lockPeriod } = await request.json()

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const signer = new ethers.Wallet(process.env.MCC_STAKING_PRIVATE_KEY!, provider)

    const stakingContract = new ethers.Contract(process.env.MCC_STAKING_CONTRACT_ADDRESS!, STAKING_CONTRACT_ABI, signer)

    let tx

    switch (action) {
      case "stake":
        if (!amount || !lockPeriod) {
          return NextResponse.json({ error: "Amount and lock period required" }, { status: 400 })
        }
        tx = await stakingContract.stake(ethers.parseEther(amount.toString()), lockPeriod)
        break

      case "unstake":
        tx = await stakingContract.unstake()
        break

      case "claimRewards":
        tx = await stakingContract.claimRewards()
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const receipt = await tx.wait()

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    })
  } catch (error) {
    console.error("Staking error:", error)
    return NextResponse.json({ error: "Staking operation failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("address")

    if (!userAddress) {
      return NextResponse.json({ error: "Address required" }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const stakingContract = new ethers.Contract(
      process.env.MCC_STAKING_CONTRACT_ADDRESS!,
      STAKING_CONTRACT_ABI,
      provider,
    )

    const [stakeInfo, pendingRewards] = await stakingContract.getStakeInfo(userAddress)

    return NextResponse.json({
      stake: {
        amount: ethers.formatEther(stakeInfo.amount),
        startTime: Number(stakeInfo.startTime),
        lastRewardTime: Number(stakeInfo.lastRewardTime),
        accumulatedRewards: ethers.formatEther(stakeInfo.accumulatedRewards),
        lockPeriod: Number(stakeInfo.lockPeriod),
      },
      pendingRewards: ethers.formatEther(pendingRewards),
    })
  } catch (error) {
    console.error("Stake info error:", error)
    return NextResponse.json({ error: "Failed to fetch stake info" }, { status: 500 })
  }
}
