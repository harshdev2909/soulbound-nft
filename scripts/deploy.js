const hre = require("hardhat");

async function main() {
  const name = process.env.NFT_NAME || "Telis Soulbound";
  const symbol = process.env.NFT_SYMBOL || "SBT";

  const SoulboundNFT = await hre.ethers.getContractFactory("SoulboundNFT");
  const nft = await SoulboundNFT.deploy(name, symbol);
  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log("SoulboundNFT deployed to:", address);
  console.log("Name:", name);
  console.log("Symbol:", symbol);

  // Optional: mint at deploy time (default: mint 1 to deployer)
  const [deployer] = await hre.ethers.getSigners();
  const mintTo = process.env.MINT_TO || deployer.address;
  const shouldMint = process.env.MINT_AT_DEPLOY !== "false"; // default true

  if (shouldMint) {
    const tx = await nft.mint(mintTo);
    await tx.wait();
    const tokenId = 1n;
    console.log("Minted token", tokenId.toString(), "to", mintTo);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
