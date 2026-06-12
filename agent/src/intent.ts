import { keccak256, toHex } from "viem";

export interface Intent {
  text: string;        // human readable statement of what the agent means to do
  recipient: string;
  amount: string;      // in token units, as a string for the record
}

/// Hash the declared intent so it can be bound into the receipt.
export function hashIntent(intent: Intent): `0x${string}` {
  const canonical = `${intent.text}|${intent.recipient}|${intent.amount}`;
  return keccak256(toHex(canonical));
}
