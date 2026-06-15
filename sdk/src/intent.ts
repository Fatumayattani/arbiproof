import { keccak256, toHex } from "viem";
import type { Intent } from "./types.js";

/// Canonical hash of a declared intent, bound into the receipt.
export function hashIntent(intent: Intent): `0x${string}` {
  return keccak256(toHex(`${intent.text}|${intent.recipient}|${intent.amount}`));
}
