import { parseEther } from "viem";
import { GRANT_ID, ALLOWED_RECIPIENT } from "./config.js";
import { hashIntent } from "./intent.js";
import { executePlainKey } from "./executor.js";
import { recordReceipt } from "./receipt.js";

// Happy path. The agent does exactly what it was authorized to do, then anchors
// a receipt. The verifier will independently mark this PASS.
async function main() {
  const amount = parseEther("50");

  const intent = {
    text: "pay supplier for invoice 1042",
    recipient: ALLOWED_RECIPIENT,
    amount: "50"
  };
  const intentHash = hashIntent(intent);
  console.log("declared intent:", intent.text);

  // TODO swap executePlainKey for the ZeroDev scoped client once wired
  const actionTxHash = await executePlainKey(ALLOWED_RECIPIENT, amount);
  console.log("action tx:", actionTxHash);

  const receiptId = await recordReceipt({ grantId: GRANT_ID, intentHash, actionTxHash });
  console.log("done. verify receipt:", receiptId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
