import { expect } from "chai"
import { ethers } from "hardhat"
import type { Contract } from "ethers"
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("PuffPass", () => {
  let puffPass: Contract
  let admin: SignerWithAddress
  let user: SignerWithAddress
  let other: SignerWithAddress

  beforeEach(async () => {
    ;[admin, user, other] = await ethers.getSigners()

    const PuffPass = await ethers.getContractFactory("PuffPass")
    puffPass = await PuffPass.deploy("ipfs://placeholder/")
    await puffPass.deployed()
  })

  describe("Deployment", () => {
    it("Should set the right admin", async () => {
      expect(await puffPass.hasRole(await puffPass.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true
    })

    it("Should set the base URI", async () => {
      expect(await puffPass.uri(0)).to.equal("ipfs://placeholder/")
    })
  })

  describe("Minting", () => {
    it("Should mint and store custom URI", async () => {
      await puffPass.mint(user.address, 1, "ipfs://green.json")
      expect(await puffPass.uri(1)).to.equal("ipfs://green.json")
      expect(await puffPass.balanceOf(user.address, 1)).to.equal(1)
    })

    it("Should only allow minters to mint", async () => {
      await expect(puffPass.connect(user).mint(user.address, 1, "ipfs://green.json")).to.be.revertedWith(
        "AccessControl: account",
      )
    })
  })

  describe("Soulbound Properties", () => {
    beforeEach(async () => {
      await puffPass.mint(user.address, 1, "ipfs://green.json")
    })

    it("Should reject transfers", async () => {
      await expect(puffPass.connect(user).safeTransferFrom(user.address, other.address, 1, 1, "0x")).to.be.revertedWith(
        "Soulbound: non-transferable",
      )
    })

    it("Should reject batch transfers", async () => {
      await expect(
        puffPass.connect(user).safeBatchTransferFrom(user.address, other.address, [1], [1], "0x"),
      ).to.be.revertedWith("Soulbound: non-transferable")
    })

    it("Should reject approvals", async () => {
      await expect(puffPass.connect(user).setApprovalForAll(other.address, true)).to.be.revertedWith(
        "Soulbound: non-transferable",
      )
    })
  })

  describe("Tier Management", () => {
    it("Should handle multiple tier mints", async () => {
      // Mint Green tier
      await puffPass.mint(user.address, 1, "ipfs://green.json")
      expect(await puffPass.balanceOf(user.address, 1)).to.equal(1)

      // Upgrade to Gold tier
      await puffPass.mint(user.address, 2, "ipfs://gold.json")
      expect(await puffPass.balanceOf(user.address, 2)).to.equal(1)

      // Should still have Green tier
      expect(await puffPass.balanceOf(user.address, 1)).to.equal(1)
    })
  })
})
