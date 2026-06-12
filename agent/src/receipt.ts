import { keccak256, toHex, type Address } from "viem";
import { registryAbi } from "./abis.js";
import { REGISTRY, walletClient, publicClient } from "./config.js";

/// Anchor a receipt binding grant, intent, and the action tx hash.
export async function recordReceipt(params: {
  grantId: `0x${string}`;
  intentHash: `0x${string}`;
  actionTxHash: `0x${string}`;
}): Promise<`0x${string}`> {
  const receiptId = keccak256(toHex(`${params.grantId}:${params.actionTxHash}`));

  const hash = await walletClient.writeContract({
    address: REGISTRY as Address,
    abi: registryAbi,
    functionName: "recordReceipt",
    args: [receiptId, params.grantId, params.intentHash, params.actionTxHash]
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("receipt recorded:", receiptId);
  return receiptId;
}
