import { encodeFunctionData, type Address } from "viem";
import { actionAbi, erc20Abi } from "./abis.js";
import { ACTION, TOKEN, walletClient, publicClient, account } from "./config.js";

/// Fallback path: act with the agent's plain key. BoundedAction still enforces
/// the allowlist and cap onchain, so an out of scope call reverts here too.
/// Swap this for the ZeroDev scoped client once sessionKey.ts is wired.
export async function executePlainKey(recipient: Address, amount: bigint): Promise<`0x${string}`> {
  // approve once so BoundedAction can pull the token
  const approveHash = await walletClient.writeContract({
    address: TOKEN,
    abi: erc20Abi,
    functionName: "approve",
    args: [ACTION, amount]
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  const txHash = await walletClient.writeContract({
    address: ACTION,
    abi: actionAbi,
    functionName: "execute",
    args: [recipient, amount]
  });
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/// Helper kept for parity with the scoped path.
export function encodeExecute(recipient: Address, amount: bigint) {
  return encodeFunctionData({ abi: actionAbi, functionName: "execute", args: [recipient, amount] });
}
