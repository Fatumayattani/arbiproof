import { decodeFunctionData, type Address } from "viem";
import { publicClient, REGISTRY } from "./client.js";

// Minimal registry ABI for reads.
const registryReadAbi = [
  {
    type: "function",
    name: "getReceipt",
    stateMutability: "view",
    inputs: [{ name: "receiptId", type: "bytes32" }],
    outputs: [{
      name: "", type: "tuple", components: [
        { name: "grantId", type: "bytes32" },
        { name: "agent", type: "address" },
        { name: "intentHash", type: "bytes32" },
        { name: "txRef", type: "bytes32" },
        { name: "timestamp", type: "uint256" },
        { name: "exists", type: "bool" }
      ]
    }]
  },
  {
    type: "function",
    name: "getGrant",
    stateMutability: "view",
    inputs: [{ name: "grantId", type: "bytes32" }],
    outputs: [{
      name: "", type: "tuple", components: [
        { name: "agent", type: "address" },
        { name: "target", type: "address" },
        { name: "selector", type: "bytes4" },
        { name: "recipient", type: "address" },
        { name: "maxAmount", type: "uint256" },
        { name: "expiry", type: "uint64" },
        { name: "exists", type: "bool" }
      ]
    }]
  }
] as const;

const actionAbi = [
  {
    type: "function",
    name: "execute",
    stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: []
  }
] as const;

export interface Verdict {
  pass: boolean;
  reasons: string[];
  receipt: any;
  grant: any;
  decoded: { recipient: Address; amount: bigint } | null;
  txHash: `0x${string}`;
}

/// Load receipt, grant, and the real action tx, then judge scope independently.
export async function verify(receiptId: `0x${string}`): Promise<Verdict> {
  const receipt: any = await publicClient.readContract({
    address: REGISTRY, abi: registryReadAbi, functionName: "getReceipt", args: [receiptId]
  });
  if (!receipt.exists) throw new Error("no such receipt");

  const grant: any = await publicClient.readContract({
    address: REGISTRY, abi: registryReadAbi, functionName: "getGrant", args: [receipt.grantId]
  });

  const txHash = receipt.txRef as `0x${string}`;
  const tx = await publicClient.getTransaction({ hash: txHash });

  const reasons: string[] = [];
  let decoded: { recipient: Address; amount: bigint } | null = null;

  // 1. the tx must target the granted contract
  if (tx.to?.toLowerCase() !== grant.target.toLowerCase()) {
    reasons.push("action called a contract outside the grant");
  }

  // 2. decode and check selector, recipient, amount against the grant
  try {
    const d = decodeFunctionData({ abi: actionAbi, data: tx.input });
    const [recipient, amount] = d.args as [Address, bigint];
    decoded = { recipient, amount };
    if (recipient.toLowerCase() !== grant.recipient.toLowerCase()) {
      reasons.push("recipient is not the allowlisted address");
    }
    if (amount > grant.maxAmount) {
      reasons.push("amount exceeds the per call cap");
    }
  } catch {
    reasons.push("action called a function outside the grant");
  }

  return { pass: reasons.length === 0, reasons, receipt, grant, decoded, txHash };
}
