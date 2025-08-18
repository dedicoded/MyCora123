import { describe, it, expect, beforeEach } from "vitest"
import { ethers } from "hardhat"
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("MyCora System Integration Tests", () => {
  let admin: SignerWithAddress
  let user: SignerWithAddress
  let business: SignerWithAddress
  let mccToken: any
  let staking: any
  let puffPass: any

  beforeEach(async () => {
    ;[admin, user, business] = await ethers.getSigners()

    // Deploy contracts
    const MCCToken = await ethers.getContractFactory("MyCoraCoin")
    mccToken = await MCCToken.deploy()

    const MCCStaking = await ethers.getContractFactory("MCCStaking")
    staking = await MCCStaking.deploy(mccToken.address)

    const PuffPass = await ethers.getContractFactory("PuffPassRewards")
    puffPass = await PuffPass.deploy()
  })

  describe("Role-Based Access Control", () => {
    it("should allow admin to mint MCC tokens", async () => {
      await mccToken.connect(admin).mint(user.address, ethers.utils.parseEther("100"))
      const balance = await mccToken.balanceOf(user.address)
      expect(balance).to.equal(ethers.utils.parseEther("100"))
    })

    it("should prevent users from minting MCC tokens", async () => {
      await expect(mccToken.connect(user).mint(user.address, ethers.utils.parseEther("100"))).to.be.revertedWith(
        "AccessControl: account is missing role",
      )
    })

    it("should allow business accounts to burn MCC tokens", async () => {
      // Grant business role and mint tokens first
      const BUSINESS_ROLE = await mccToken.BUSINESS_ROLE()
      await mccToken.connect(admin).grantRole(BUSINESS_ROLE, business.address)
      await mccToken.connect(admin).mint(business.address, ethers.utils.parseEther("100"))

      // Business should be able to burn
      await mccToken.connect(business).burn(ethers.utils.parseEther("50"))
      const balance = await mccToken.balanceOf(business.address)
      expect(balance).to.equal(ethers.utils.parseEther("50"))
    })
  })

  describe("Staking Integration", () => {
    it("should allow users to stake MCC tokens", async () => {
      // Mint and approve tokens
      await mccToken.connect(admin).mint(user.address, ethers.utils.parseEther("100"))
      await mccToken.connect(user).approve(staking.address, ethers.utils.parseEther("100"))

      // Stake tokens
      await staking.connect(user).stake(ethers.utils.parseEther("100"), 0) // Flexible staking

      const stakedAmount = await staking.getStakedAmount(user.address)
      expect(stakedAmount).to.equal(ethers.utils.parseEther("100"))
    })

    it("should calculate rewards correctly", async () => {
      // Setup staking
      await mccToken.connect(admin).mint(user.address, ethers.utils.parseEther("100"))
      await mccToken.connect(user).approve(staking.address, ethers.utils.parseEther("100"))
      await staking.connect(user).stake(ethers.utils.parseEther("100"), 0)

      // Fast forward time (simulate 1 year)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60])
      await ethers.provider.send("evm_mine", [])

      const rewards = await staking.calculateRewards(user.address)
      expect(rewards).to.be.gt(0) // Should have earned rewards
    })
  })

  describe("PuffPass NFT Integration", () => {
    it("should mint NFT rewards based on purchase count", async () => {
      // Simulate purchases
      await puffPass.connect(admin).recordPurchase(user.address, ethers.utils.parseEther("25"))
      await puffPass.connect(admin).recordPurchase(user.address, ethers.utils.parseEther("25"))
      await puffPass.connect(admin).recordPurchase(user.address, ethers.utils.parseEther("25"))
      await puffPass.connect(admin).recordPurchase(user.address, ethers.utils.parseEther("25"))

      // Should have Bronze tier (4 purchases)
      const userStatus = await puffPass.getUserStatus(user.address)
      expect(userStatus.currentTier).to.equal(1) // Bronze tier
      expect(userStatus.purchaseCount).to.equal(4)
    })
  })

  describe("End-to-End Workflow", () => {
    it("should complete full user journey: mint → stake → earn rewards → claim NFT", async () => {
      // 1. Admin mints MCC for user
      await mccToken.connect(admin).mint(user.address, ethers.utils.parseEther("1000"))

      // 2. User stakes MCC
      await mccToken.connect(user).approve(staking.address, ethers.utils.parseEther("500"))
      await staking.connect(user).stake(ethers.utils.parseEther("500"), 1) // Locked staking

      // 3. Simulate time passage for rewards
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]) // 30 days
      await ethers.provider.send("evm_mine", [])

      // 4. User should have earned rewards
      const rewards = await staking.calculateRewards(user.address)
      expect(rewards).to.be.gt(0)

      // 5. Record purchases for PuffPass
      for (let i = 0; i < 10; i++) {
        await puffPass.connect(admin).recordPurchase(user.address, ethers.utils.parseEther("10"))
      }

      // 6. User should have Silver tier NFT
      const userStatus = await puffPass.getUserStatus(user.address)
      expect(userStatus.currentTier).to.equal(2) // Silver tier

      // 7. Verify complete integration
      const mccBalance = await mccToken.balanceOf(user.address)
      const stakedAmount = await staking.getStakedAmount(user.address)

      expect(mccBalance).to.equal(ethers.utils.parseEther("500")) // Remaining balance
      expect(stakedAmount).to.equal(ethers.utils.parseEther("500")) // Staked amount
      expect(userStatus.purchaseCount).to.equal(10) // Total purchases
    })
  })
})
