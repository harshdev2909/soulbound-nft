"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  getContract,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  encodeFunctionData,
} from "viem";
import {
  SOULBOUND_NFT_ADDRESS,
  SOULBOUND_ABI,
} from "@/lib/contract";
import { megaEth } from "@/lib/chains";

const RPC = "https://mainnet.megaeth.com/rpc";
const publicClient = createPublicClient({
  chain: megaEth,
  transport: http(RPC),
});

const contract = getContract({
  address: SOULBOUND_NFT_ADDRESS as `0x${string}`,
  abi: SOULBOUND_ABI,
  client: publicClient,
});

type OwnedToken = { tokenId: bigint; tokenURI: string; image?: string };

export default function Home() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [ownedTokens, setOwnedTokens] = useState<OwnedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [mintSingleAddress, setMintSingleAddress] = useState("");
  const [mintBatchAddresses, setMintBatchAddresses] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [addToWalletTokenId, setAddToWalletTokenId] = useState("1");

  // Use connected wallet address (e.g. MetaMask) so we show NFTs for the right account
  const userAddress =
    (wallets[0]?.address as string | undefined) ??
    user?.wallet?.address ??
    null;

  const fetchBalance = useCallback(async () => {
    if (!userAddress) return;
    try {
      const b = (await contract.read.balanceOf([userAddress as `0x${string}`])) as bigint;
      setBalance(b);
    } catch {
      setBalance(BigInt(0));
    }
  }, [userAddress]);

  const fetchOwnedTokens = useCallback(async () => {
    if (!userAddress || balance === BigInt(0)) {
      setOwnedTokens([]);
      return;
    }
    const tokens: OwnedToken[] = [];
    const maxScan = 500;
    for (let id = 1; id <= maxScan && tokens.length < Number(balance); id++) {
      try {
        const owner = (await contract.read.ownerOf([BigInt(id)])) as string;
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const tokenURI = (await contract.read.tokenURI([BigInt(id)])) as string;
          let image: string | undefined;
          try {
            const res = await fetch(tokenURI);
            const json = (await res.json()) as { image?: string };
            image = json.image;
          } catch {
            // ignore
          }
          tokens.push({
            tokenId: BigInt(id),
            tokenURI,
            image,
          });
        }
      } catch {
        // not owned or invalid id
      }
    }
    setOwnedTokens(tokens);
  }, [userAddress, balance]);

  useEffect(() => {
    if (!userAddress) return;
    fetchBalance();
  }, [userAddress, fetchBalance]);

  useEffect(() => {
    if (!userAddress) {
      setOwnedTokens([]);
      return;
    }
    if (balance === BigInt(0)) {
      setOwnedTokens([]);
      return;
    }
    fetchOwnedTokens();
  }, [userAddress, balance, fetchOwnedTokens]);

  const handleMintSingle = async () => {
    if (!mintSingleAddress.trim() || !wallets[0]) return;
    setLoading(true);
    setTxStatus(null);
    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: megaEth,
        transport: custom(provider),
      });
      const [account] = await walletClient.getAddresses();
      if (!account) throw new Error("No account");
      const data = encodeFunctionData({
        abi: SOULBOUND_ABI,
        functionName: "mint",
        args: [mintSingleAddress.trim() as `0x${string}`],
      });
      const hash = await walletClient.sendTransaction({
        account,
        to: SOULBOUND_NFT_ADDRESS as `0x${string}`,
        data,
      });
      setTxStatus(`Minted! Tx: ${hash}`);
      setMintSingleAddress("");
      fetchBalance();
    } catch (e: any) {
      setTxStatus(`Error: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMintBatch = async () => {
    const addresses = mintBatchAddresses
      .split(/[\n,]/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (!addresses.length || !wallets[0]) return;
    setLoading(true);
    setTxStatus(null);
    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: megaEth,
        transport: custom(provider),
      });
      const [account] = await walletClient.getAddresses();
      if (!account) throw new Error("No account");
      const data = encodeFunctionData({
        abi: SOULBOUND_ABI,
        functionName: "mintBatch",
        args: [addresses as `0x${string}`[]],
      });
      const hash = await walletClient.sendTransaction({
        account,
        to: SOULBOUND_NFT_ADDRESS as `0x${string}`,
        data,
      });
      setTxStatus(`Minted ${addresses.length} NFTs! Tx: ${hash}`);
      setMintBatchAddresses("");
      fetchBalance();
    } catch (e: any) {
      setTxStatus(`Error: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const addNftToWallet = async (tokenIdOverride?: string) => {
    const tokenId = (tokenIdOverride ?? addToWalletTokenId).trim() || "1";
    let tokenURI: string;
    try {
      tokenURI = (await publicClient.readContract({
        address: SOULBOUND_NFT_ADDRESS as `0x${string}`,
        abi: SOULBOUND_ABI,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      })) as string;
    } catch (e: any) {
      setTxStatus(`Invalid token ID or failed to fetch metadata: ${e?.message || e}`);
      return;
    }
    const provider = wallets[0] ? await wallets[0].getEthereumProvider() : (window as any).ethereum;
    if (!provider) {
      setTxStatus("Connect wallet first to add NFT to wallet.");
      return;
    }
    try {
      await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC721",
          options: {
            address: SOULBOUND_NFT_ADDRESS,
            tokenId,
            tokenURI,
          },
        },
      });
      setTxStatus("NFT added to wallet.");
    } catch (e: any) {
      setTxStatus(`Could not add to wallet: ${e?.message || e}`);
    }
  };

  const shareOnTwitter = (tokenId?: string) => {
    const id =
      tokenId ??
      (ownedTokens.length > 0 ? ownedTokens[0].tokenId.toString() : "1");
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/share/${id}`;
    const text = encodeURIComponent("teleport instantly");
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold">Telis</h1>
        {authenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 truncate max-w-[120px]">
              {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
            </span>
            <button
              onClick={logout}
              className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="rounded-full bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-sm font-medium hover:opacity-90"
          >
            Connect wallet
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {txStatus && (
          <div className="rounded-lg bg-zinc-200 dark:bg-zinc-800 px-4 py-2 text-sm">
            {txStatus}
          </div>
        )}

        {!authenticated && (
          <section className="text-center py-16">
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
              Connect your wallet to view your Soulbound NFTs and add them to your wallet.
            </p>
            <p className="text-zinc-500 text-sm">
              Teleport instantly.
            </p>
          </section>
        )}

        {authenticated && (
          <>
            {/* My NFTs */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Your Telis Soulbound NFTs</h2>
              <p className="text-sm text-zinc-500 mb-4">
                Balance: {balance.toString()}
              </p>
              {ownedTokens.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ownedTokens.map((t) => (
                    <div
                      key={t.tokenId.toString()}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900"
                    >
                      {t.image ? (
                        <img
                          src={t.image}
                          alt={`Token ${t.tokenId}`}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500">
                          # {t.tokenId.toString()}
                        </div>
                      )}
                      <div className="p-3 space-y-2">
                        <p className="text-sm font-medium">Telis #{t.tokenId.toString()}</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => addNftToWallet(t.tokenId.toString())}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Add to wallet
                          </button>
                          <button
                            type="button"
                            onClick={() => shareOnTwitter(t.tokenId.toString())}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Share with image
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">You don’t own any Telis Soulbound NFTs yet.</p>
              )}
            </section>

            {/* Add to wallet (manual token ID) */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Add NFT to wallet</h2>
              <p className="text-sm text-zinc-500 mb-3">
                Add a Telis Soulbound NFT to your connected wallet so it appears in your wallet app.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Token ID (e.g. 1)"
                  value={addToWalletTokenId}
                  onChange={(e) => setAddToWalletTokenId(e.target.value)}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm w-32"
                />
                <button
                  onClick={() => addNftToWallet()}
                  className="rounded-lg bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black px-4 py-2 text-sm font-medium hover:opacity-90"
                >
                  Add to wallet
                </button>
              </div>
            </section>

            {/* Share on Twitter */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Share</h2>
              <p className="text-sm text-zinc-500 mb-3">
                Share on X with the caption &quot;teleport instantly&quot; and a link that shows your NFT image in the tweet.
              </p>
              <button
                onClick={() => shareOnTwitter()}
                className="rounded-full bg-[#1DA1F2] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 flex items-center gap-2"
              >
                <span>Share on X (Twitter)</span>
                <span className="text-xs opacity-90">— with NFT image</span>
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
