// Run: npx tsx examples/verify.ts <receiptId>
// Read only, no key needed.
import { ArbiProof } from "../src/index.js";

const receiptId = (process.argv[2] ??
  "0x221cd2014c4f2bf3a2dfffcc15428cde0bcbd3383bfdf08c75beb29a5cbe3f17") as `0x${string}`;

const ap = new ArbiProof();

const v = await ap.verify(receiptId);
console.log(v.pass ? "CLEARED" : "FLAGGED");
for (const c of v.checks) {
  console.log(`  ${c.ok ? "ok " : "no "} ${c.label}: ${c.authorized} vs ${c.executed}`);
}
