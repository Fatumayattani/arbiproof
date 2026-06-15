import { decodeFunctionData, formatEther, type Address, type PublicClient } from "viem";
import { registryAbi, actionAbi } from "./abi.js";
import type { Verdict, Check } from "./types.js";

function short(a: string) { return `${a.slice(0, 6)}\u2026${a.slice(-4)}`; }

/// Load receipt, grant, and the real transaction, then judge each rule
/// independently. The verdict is recomputed from chain, never trusted.
export async function verifyReceipt(
  publicClient: PublicClient,
  registry: Address,
  receiptId: `0x${string}`
): Promise<Verdict> {
  const receipt: any = await publicClient.readContract({
    address: registry, abi: registryAbi, functionName: "getReceipt", args: [receiptId]
  });
  if (!receipt.exists) throw new Error("No receipt found for that id.");

  const grant: any = await publicClient.readContract({
    address: registry, abi: registryAbi, functionName: "getGrant", args: [receipt.grantId]
  });

  const txHash = receipt.txRef as `0x${string}`;
  const tx = await publicClient.getTransaction({ hash: txHash });

  const checks: Check[] = [];

  const targetOk = tx.to?.toLowerCase() === grant.target.toLowerCase();
  checks.push({
    label: "target",
    authorized: short(grant.target),
    executed: tx.to ? short(tx.to) : "none",
    ok: targetOk
  });

  try {
    const d = decodeFunctionData({ abi: actionAbi, data: tx.input });
    const [recipient, amount] = d.args as [Address, bigint];

    checks.push({
      label: "recipient",
      authorized: short(grant.recipient),
      executed: short(recipient),
      ok: recipient.toLowerCase() === grant.recipient.toLowerCase()
    });
    checks.push({
      label: "amount",
      authorized: `<= ${formatEther(grant.maxAmount)}`,
      executed: formatEther(amount),
      ok: amount <= grant.maxAmount
    });
  } catch {
    checks.push({ label: "function", authorized: "execute(address,uint256)", executed: "outside the grant", ok: false });
  }

  return {
    pass: checks.every((c) => c.ok),
    checks,
    agent: receipt.agent,
    intentHash: receipt.intentHash,
    txHash,
    timestamp: receipt.timestamp
  };
}
