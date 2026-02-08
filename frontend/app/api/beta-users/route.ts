import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;

export async function GET() {
  try {
    const path = join(process.cwd(), "users.csv");
    const raw = readFileSync(path, "utf-8");
    const matches = raw.match(ETH_ADDRESS_REGEX) ?? [];
    const addresses = [...new Set(matches.map((a) => a.toLowerCase()))];
    return NextResponse.json({ addresses });
  } catch (e) {
    console.error("Failed to read beta users:", e);
    return NextResponse.json({ addresses: [] }, { status: 200 });
  }
}
