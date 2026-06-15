import type { Address } from "viem";

export interface ArbiProofConfig {
  /// RPC url. Defaults to the public Arbitrum Sepolia endpoint.
  rpcUrl?: string;
  /// ReceiptRegistry address. Defaults to the deployed registry.
  registry?: Address;
  /// Private key for write methods (registerGrant, recordReceipt, prove).
  /// Omit for a read only client (verify, getReceipt, getGrant still work).
  privateKey?: `0x${string}`;
}

export interface Grant {
  agent: Address;
  target: Address;
  selector: `0x${string}`;
  recipient: Address;
  maxAmount: bigint;
  expiry: bigint;
  exists: boolean;
}

export interface Receipt {
  grantId: `0x${string}`;
  agent: Address;
  intentHash: `0x${string}`;
  txRef: `0x${string}`;
  timestamp: bigint;
  exists: boolean;
}

export interface Intent {
  text: string;
  recipient: string;
  amount: string;
}

export interface Check {
  label: string;
  authorized: string;
  executed: string;
  ok: boolean;
}

export interface Verdict {
  pass: boolean;
  checks: Check[];
  agent: Address;
  intentHash: `0x${string}`;
  txHash: `0x${string}`;
  timestamp: bigint;
}

export interface RegisterGrantParams {
  grantId: `0x${string}`;
  agent: Address;
  target: Address;
  selector: `0x${string}`;
  recipient: Address;
  maxAmount: bigint;
  expiry: bigint;
}

export interface ProveParams {
  grantId: `0x${string}`;
  intent: Intent;
  /// Runs the agent's action and returns the resulting transaction hash.
  action: () => Promise<`0x${string}`>;
}
