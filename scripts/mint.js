const hre = require("hardhat");

// Usage: CONTRACT_ADDRESS=0x... MINT_TO=0x... npx hardhat run scripts/mint.js --network megaeth_mainnet
// Or mint to deployer: CONTRACT_ADDRESS=0x... npx hardhat run scripts/mint.js --network megaeth_mainnet
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Set CONTRACT_ADDRESS in .env or env (e.g. CONTRACT_ADDRESS=0xBd24fD29a638ce7f4dd91AF1d1Fcda8C7C84E357)");
    process.exitCode = 1;
    return;
  }

  const [deployer] = await hre.ethers.getSigners();
  const mintTo = process.env.MINT_TO || deployer.address;

  const nft = await hre.ethers.getContractAt("SoulboundNFT", contractAddress);
  const tx = await nft.mint(mintTo);
  await tx.wait();
  const totalSupply = await nft.balanceOf(mintTo);
  console.log("Minted 1 SBT to", mintTo);
  console.log("Balance of", mintTo, ":", totalSupply.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
