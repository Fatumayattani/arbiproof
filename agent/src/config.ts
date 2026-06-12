import "dotenv/config";
import { createPublicClient, createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

export const RPC = need("ARBITRUM_SEPOLIA_RPC");
export const REGISTRY = need("RECEIPT_REGISTRY_ADDRESS") as Address;
export const ACTION = need("BOUNDED_ACTION_ADDRESS") as Address;
export const TOKEN = need("MOCK_TOKEN_ADDRESS") as Address;
export const GRANT_ID = need("GRANT_ID") as `0x${string}`;
export const ALLOWED_RECIPIENT = need("ALLOWED_RECIPIENT") as Address;
export const OUT_OF_SCOPE_RECIPIENT = need("OUT_OF_SCOPE_RECIPIENT") as Address;

export const account = privateKeyToAccount(need("AGENT_PRIVATE_KEY") as `0x${string}`);

export const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(RPC) });
export const walletClient = createWalletClient({ account, chain: arbitrumSepolia, transport: http(RPC) });
