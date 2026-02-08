"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { megaEth } from "@/lib/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-red-600">
        
      </div>
    );
  }
  return (
    <PrivyProvider
      appId={appId}
      config={{
        supportedChains: [megaEth],
        defaultChain: megaEth,
        loginMethods: ["email", "wallet", "google", "twitter"],
        appearance: {
          theme: "light",
          accentColor: "#171717",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
