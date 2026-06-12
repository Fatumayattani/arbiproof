# ArbiProof

Bounded, auditable authority for AI agents on Arbitrum.

Every agent action runs inside an onchain permission grant and emits a receipt
that binds the agent's declared intent to its authorization to the resulting
transaction. Anyone can then prove the agent stayed within what it was allowed
to do.

## Pieces

1. contracts  Foundry project. ReceiptRegistry holds grants and receipts.
   BoundedAction is the demo target that enforces allowlist plus cap and reverts
   on any out of scope call.
2. agent      TypeScript agent. Declares intent, executes through a scoped
   ZeroDev session key, then anchors a receipt onchain.
3. verifier   Vite plus React app. Paste a receipt id, see the grant, the intent,
   the Arbiscan tx, and a PASS or FAIL verdict computed independently from the
   agent's claim.

## Chain

Arbitrum Sepolia testnet. Free, fast, counts as deployed on Arbitrum.

## Build order

contracts first, then agent, then verifier. See each folder README.
The riskiest piece is the ZeroDev session key, so wire that before polishing.
