import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

const rpc = import.meta.env.VITE_ARBITRUM_SEPOLIA_RPC as string;

export const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) });

export const REGISTRY = import.meta.env.VITE_RECEIPT_REGISTRY_ADDRESS as `0x${string}`;
