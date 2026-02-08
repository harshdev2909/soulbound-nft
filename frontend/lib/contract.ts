export const SOULBOUND_NFT_ADDRESS =
  (typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string)
    : process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) ||
  "0xBd24fD29a638ce7f4dd91AF1d1Fcda8C7C84E357";

export const MEGAETH_CHAIN_ID = 4326;

// JSON ABI format for viem (readContract and getContract)
export const SOULBOUND_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "to", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintBatch",
    inputs: [
      {
        name: "recipients",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      { name: "", type: "uint256[]", internalType: "uint256[] memory" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;
