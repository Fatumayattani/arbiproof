import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

const rpc = (((import.meta as any).env?.VITE_ARBITRUM_SEPOLIA_RPC as string) ||
  "https://sepolia-rollup.arbitrum.io/rpc");

export const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) });

export const REGISTRY = (((import.meta as any).env?.VITE_RECEIPT_REGISTRY_ADDRESS as string) ||
  "0x7C5f4b0862aeE3AE6496bC6FF67a72234d10148a") as `0x${string}`;