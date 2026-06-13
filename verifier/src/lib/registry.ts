import { decodeFunctionData, formatEther, type Address } from "viem";
import { publicClient, REGISTRY } from "./client.js";

const registryReadAbi = [
  {
    type: "function", name: "getReceipt", stateMutability: "view",
    inputs: [{ name: "receiptId", type: "bytes32" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "grantId", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "intentHash", type: "bytes32" },
      { name: "txRef", type: "bytes32" },
      { name: "timestamp", type: "uint256" },
      { name: "exists", type: "bool" }
    ]}]
  },
  {
    type: "function", name: "getGrant", stateMutability: "view",
    inputs: [{ name: "grantId", type: "bytes32" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "agent", type: "address" },
      { name: "target", type: "address" },
      { name: "selector", type: "bytes4" },
      { name: "recipient", type: "address" },
      { name: "maxAmount", type: "uint256" },
      { name: "expiry", type: "uint64" },
      { name: "exists", type: "bool" }
    ]}]
  }
] as const;

const actionAbi = [
  {
    type: "function", name: "execute", stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: []
  }
] as const;

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
  intentHash: string;
  timestamp: bigint;
  txHash: `0x${string}`;
}

function short(addr: string) {
  return `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`;
}

/// Load receipt, grant, and the real action transaction, then judge each rule
/// independently. The verdict is the aggregate, computed here, not trusted.
export async function verify(receiptId: `0x${string}`): Promise<Verdict> {
  const receipt: any = await publicClient.readContract({
    address: REGISTRY, abi: registryReadAbi, functionName: "getReceipt", args: [receiptId]
  });
  if (!receipt.exists) throw new Error("No receipt found for that id.");

  const grant: any = await publicClient.readContract({
    address: REGISTRY, abi: registryReadAbi, functionName: "getGrant", args: [receipt.grantId]
  });

  const txHash = receipt.txRef as `0x${string}`;
  const tx = await publicClient.getTransaction({ hash: txHash });

  const checks: Check[] = [];

  // 1. target contract
  const targetOk = tx.to?.toLowerCase() === grant.target.toLowerCase();
  checks.push({
    label: "Target contract",
    authorized: short(grant.target),
    executed: tx.to ? short(tx.to) : "none",
    ok: targetOk
  });

  // 2 and 3. decode the call and check recipient and amount
  try {
    const d = decodeFunctionData({ abi: actionAbi, data: tx.input });
    const [recipient, amount] = d.args as [Address, bigint];

    const recipientOk = recipient.toLowerCase() === grant.recipient.toLowerCase();
    checks.push({
      label: "Recipient",
      authorized: short(grant.recipient),
      executed: short(recipient),
      ok: recipientOk
    });

    const amountOk = amount <= grant.maxAmount;
    checks.push({
      label: "Amount",
      authorized: `\u2264 ${formatEther(grant.maxAmount)} APT`,
      executed: `${formatEther(amount)} APT`,
      ok: amountOk
    });
  } catch {
    checks.push({
      label: "Function",
      authorized: "execute(address,uint256)",
      executed: "outside the grant",
      ok: false
    });
  }

  return {
    pass: checks.every((c) => c.ok),
    checks,
    agent: receipt.agent,
    intentHash: receipt.intentHash,
    timestamp: receipt.timestamp,
    txHash
  };
}
