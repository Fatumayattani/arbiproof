# arbiproof

Bounded, auditable authority for AI agents on Arbitrum, in one client.

Register grants, prove an action, verify any receipt, and read receipts and grants. Defaults to the deployed ReceiptRegistry on Arbitrum Sepolia, so it works out of the box.

## Install

```
npm install arbiproof viem
```

## Quick start

```ts
import { ArbiProof } from "arbiproof";

// read only client (verify and reads)
const ap = new ArbiProof();

const verdict = await ap.verify("0x221c...3f17");
console.log(verdict.pass ? "CLEARED" : "FLAGGED");
console.log(verdict.checks); // target, recipient, amount, each with ok
```

## With a key, for writes

```ts
const ap = new ArbiProof({
  privateKey: "0x...",                 // agent or authorizer key
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
});
```

### Authorizer registers a grant

```ts
import { toFunctionSelector } from "viem";

await ap.registerGrant({
  grantId: "0x...",                    // any unique bytes32
  agent: "0xAgent...",
  target: "0xActionContract...",
  selector: toFunctionSelector("execute(address,uint256)"),
  recipient: "0xAllowed...",
  maxAmount: 100n * 10n ** 18n,        // per call cap
  expiry: BigInt(Math.floor(Date.now() / 1000) + 7 * 86400),
});
```

### Agent proves an action

```ts
const { receiptId, txHash } = await ap.prove({
  grantId: "0x...",
  intent: { text: "pay supplier for invoice 1042", recipient: "0xAllowed...", amount: "50" },
  action: async () => {
    // run your real onchain action, return its tx hash
    return await myActionCall();
  },
});
```

`prove` hashes the intent, runs your action, and anchors a receipt binding the grant, the intent, and the transaction. The verifier can then audit it.

### Anyone verifies

```ts
const v = await ap.verify(receiptId);
// v.pass, v.checks, v.agent, v.intentHash, v.txHash, v.timestamp
```

## API

- `new ArbiProof(config?)` where config is `{ rpcUrl?, registry?, privateKey? }`
- `registerGrant(params)` write, authorizer only
- `prove({ grantId, intent, action })` write, runs the action then records
- `recordReceipt({ grantId, intentHash, txRef })` write, low level
- `verify(receiptId)` read, recomputes the verdict from chain
- `getReceipt(receiptId)` read
- `getGrant(grantId)` read
- `hashIntent(intent)` helper

## Note on verification

The grant model pins a target, selector, recipient, and amount cap, matching an action shaped like `execute(address,uint256)`. The verifier decodes the real transaction against that shape and checks each value. The verdict is recomputed from chain, so the agent's word is never trusted.

## License

MIT
