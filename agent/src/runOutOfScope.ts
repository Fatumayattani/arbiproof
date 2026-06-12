import { parseEther } from "viem";
import { OUT_OF_SCOPE_RECIPIENT } from "./config.js";
import { executePlainKey } from "./executor.js";

// The demo money shot. The agent tries to send to a recipient outside its grant.
// BoundedAction reverts, so no receipt is ever written. Lead the walkthrough
// video with this: the bound is real, not a label.
async function main() {
  const amount = parseEther("50");
  console.log("attempting out of scope action to", OUT_OF_SCOPE_RECIPIENT);

  try {
    await executePlainKey(OUT_OF_SCOPE_RECIPIENT, amount);
    console.error("UNEXPECTED: the action did not revert. Check the allowlist.");
    process.exit(1);
  } catch (e) {
    console.log("blocked as expected. The agent cannot exceed its granted scope.");
    console.log((e as Error).message.split("\n")[0]);
  }
}

main();
