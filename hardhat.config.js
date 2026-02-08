require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    megaeth_mainnet: {
      url: process.env.MEGAETH_MAINNET_RPC || "https://mainnet.megaeth.com/rpc",
      chainId: 4326,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    megaeth_testnet: {
      url: process.env.MEGAETH_TESTNET_RPC || "https://carrot.megaeth.com/rpc",
      chainId: 6343,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      megaeth_mainnet: process.env.MEGAETH_ETHERSCAN_API_KEY || "dummy",
      megaeth_testnet: process.env.MEGAETH_ETHERSCAN_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "megaeth_mainnet",
        chainId: 4326,
        urls: {
          apiURL: "https://api.mega.etherscan.io/api",
          browserURL: "https://mega.etherscan.io",
        },
      },
      {
        network: "megaeth_testnet",
        chainId: 6343,
        urls: {
          apiURL: "https://api.testnet-mega.etherscan.io/api",
          browserURL: "https://testnet-mega.etherscan.io",
        },
      },
    ],
  },
};
