const hre = require("hardhat");

// Usage: CONTRACT_ADDRESS=0x... MINT_TO=0xaddr1,0xaddr2,0xaddr3 npx hardhat run scripts/mint-batch.js --network megaeth_mainnet
// Addresses can be comma-separated or newlines (in env use comma).
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const mintToRaw = process.env.MINT_TO;
  if (!contractAddress) {
    console.error("Set CONTRACT_ADDRESS in .env");
    process.exitCode = 1;
    return;
  }
  if (!mintToRaw || !mintToRaw.trim()) {
    console.error("Set MINT_TO with one or more addresses (comma-separated), e.g. MINT_TO=0x...,0x...");
    process.exitCode = 1;
    return;
  }

  const recipients = mintToRaw
    .split(/[\n,]/)
    .map((a) => a.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    console.error("No valid addresses in MINT_TO");
    process.exitCode = 1;
    return;
  }

  const nft = await hre.ethers.getContractAt("SoulboundNFT", contractAddress);
  const tx = await nft.mintBatch(recipients);
  await tx.wait();
  console.log("Minted", recipients.length, "SBT(s) to:", recipients.join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
