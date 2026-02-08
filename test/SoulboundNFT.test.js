const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundNFT", function () {
  let nft, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const SoulboundNFT = await ethers.getContractFactory("SoulboundNFT");
    nft = await SoulboundNFT.deploy("Test Soulbound", "TSBT");
  });

  it("should mint and set owner", async function () {
    await nft.mint(user.address);
    expect(await nft.ownerOf(1)).to.equal(user.address);
    expect(await nft.balanceOf(user.address)).to.equal(1n);
    expect(await nft.locked(1)).to.be.true;
  });

  it("should revert on transfer", async function () {
    await nft.mint(user.address);
    await expect(
      nft.connect(user).transferFrom(user.address, owner.address, 1)
    ).to.be.revertedWithCustomError(nft, "SoulboundTokenNonTransferable");
  });

  it("should revert when non-owner mints", async function () {
    await expect(
      nft.connect(user).mint(user.address)
    ).to.be.revertedWithCustomError(nft, "NotTokenOwner");
  });

  it("should support ERC5192 interface", async function () {
    expect(await nft.supportsInterface("0xb45a3c0e")).to.be.true;
  });

  it("should mint batch", async function () {
    await nft.mintBatch([user.address, owner.address]);
    expect(await nft.ownerOf(1)).to.equal(user.address);
    expect(await nft.ownerOf(2)).to.equal(owner.address);
  });
});
