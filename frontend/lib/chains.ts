import { defineChain } from "viem";

export const megaEth = defineChain({
  id: 4326,
  name: "MegaEth",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.megaeth.com/rpc"] },
  },
  blockExplorers: {
    default: {
      name: "MegaEth",
      url: "https://mega.etherscan.io",
    },
  },
});
