import type { Metadata } from "next";
import { createPublicClient, http } from "viem";
import { SOULBOUND_NFT_ADDRESS, SOULBOUND_ABI } from "@/lib/contract";
import { megaEth } from "@/lib/chains";

const RPC = "https://mainnet.megaeth.com/rpc";
const publicClient = createPublicClient({
  chain: megaEth,
  transport: http(RPC),
});

async function getNftImage(tokenId: string): Promise<string | null> {
  try {
    const tokenURI = (await publicClient.readContract({
      address: SOULBOUND_NFT_ADDRESS as `0x${string}`,
      abi: SOULBOUND_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    })) as string;
    const res = await fetch(tokenURI);
    const json = (await res.json()) as { image?: string; name?: string };
    return json.image ?? null;
  } catch {
    return null;
  }
}

type Props = { params: Promise<{ tokenId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tokenId } = await params;
  const image = await getNftImage(tokenId);
  const title = "Telis Soulbound NFT";
  const description = "Teleport instantly.";

  if (!image) {
    return { title, description };
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: "Telis NFT" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { tokenId } = await params;
  const image = await getNftImage(tokenId);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        {image ? (
          <img
            src={image}
            alt={`Telis #${tokenId}`}
            className="w-full aspect-square object-cover rounded-2xl border border-zinc-700 shadow-2xl"
          />
        ) : (
          <div className="w-full aspect-square rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
            Telis #{tokenId}
          </div>
        )}
        <p className="text-2xl font-semibold text-white tracking-tight">
          teleport instantly.
        </p>
        <p className="text-sm text-zinc-400">Telis Soulbound NFT on MegaEth</p>
      </div>
    </div>
  );
}
