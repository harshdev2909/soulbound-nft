const hre = require("hardhat");

// Set the base URI for token metadata.
// Usage: CONTRACT_ADDRESS=0x... BASE_URI=https://.../ npx hardhat run scripts/set-base-uri.js --network megaeth_mainnet
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const baseURI = process.env.BASE_URI;
  if (!contractAddress || !baseURI) {
    console.error("Set CONTRACT_ADDRESS and BASE_URI in env.");
    console.error('Example: BASE_URI=https://your-gateway.mypinata.cloud/ipfs/CID/');
    process.exitCode = 1;
    return;
  }
  const suffix = process.env.BASE_URI_SUFFIX || "";

  const nft = await hre.ethers.getContractAt("SoulboundNFT", contractAddress);
  const tx1 = await nft.setBaseURI(baseURI);
  await tx1.wait();
  console.log("Set base URI to:", baseURI);

  let effectiveSuffix = "";
  if (suffix) {
    try {
      const tx2 = await nft.setBaseURISuffix(suffix);
      await tx2.wait();
      console.log("Set base URI suffix to:", suffix);
      effectiveSuffix = suffix;
    } catch (e) {
      console.log("(This contract does not support setBaseURISuffix; tokenURI = baseURI + tokenId only)");
    }
  }
  console.log("tokenURI(1) =", baseURI + "1" + effectiveSuffix);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
