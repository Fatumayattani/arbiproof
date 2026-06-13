# ArbiProof

**Bounded, auditable authority for AI agents on Arbitrum.**

Every agent action runs inside an onchain permission grant and produces a receipt that binds the agent's declared intent to its authorization to the resulting transaction. Anyone can then prove the agent stayed within what it was allowed to do.

Built for the Arbitrum Open House London Buildathon, Best Agentic Project track.

---

## The problem

AI agents are starting to hold wallets and the right to transact. The piece nobody can show is accountability. A transaction tells you what happened, not whether the agent was authorized to do it, and not whether the action matched the agent's stated intent.

Onchain actions are already verifiable, they sit signed in the transaction log. The hard part lives offchain: proving the agent acted within the authority it was granted, and that the action it took is the one it meant to take. That binding is what ArbiProof makes provable.

## What it does

ArbiProof gives an agent a scoped permission, lets it act only inside that permission, and records a receipt that ties three things together:

1. the authorization it was granted
2. the intent it declared before acting
3. the transaction that resulted

A verifier then loads the receipt, the grant, and the real transaction, and recomputes the verdict independently. The agent's own claim is never trusted. If the action exceeded its bounds, the verdict is FLAGGED.

## How it works

Three parts, each deployed and working on Arbitrum Sepolia.

**Contracts.** `ReceiptRegistry` stores grants and receipts. A grant pins the agent, the one contract it may call, the function selector, the allowed recipient, and a per call cap. A receipt references a grant and binds the intent hash and the action transaction hash. `BoundedAction` is the action target, and it enforces the allowlist and cap onchain, so any out of scope call reverts no matter what key signs it.

**Agent.** A TypeScript agent declares an intent, hashes it, executes the action, then anchors the receipt onchain. When it attempts anything outside its grant, the action reverts and no receipt is written.

**Verifier.** A live frontend where you paste a receipt id. It reads the receipt and grant from the registry, pulls the real transaction, and checks the executed values against the grant row by row. The verdict is rendered as an audit certificate: target contract, recipient, and amount, each shown as authorized against executed, stamped CLEARED or FLAGGED.

## The audit, in one view

```
authorized                        executed                     verdict
target    0x05be...0e99           0x05be...0e99                match
recipient 0x0c66...6FfE           0x0c66...6FfE                match
amount    <= 100 APT              50 APT                       match
                                                               CLEARED
```

The verdict is the aggregate of the rows. Recompute it from the chain and you reach the same answer, which is the whole point.

## Live demo

Frontend: REPLACE_WITH_NETLIFY_URL

Sample receipt to verify (loads as CLEARED):

```
0x221cd2014c4f2bf3a2dfffcc15428cde0bcbd3383bfdf08c75beb29a5cbe3f17
```

## Deployed on Arbitrum Sepolia

Chain id 421614.

- ReceiptRegistry: `0x7C5f4b0862aeE3AE6496bC6FF67a72234d10148a`
- BoundedAction: `0x05be5dc8F5c618f81310E5DcD96FFAE46f970e99`
- MockERC20 (test token): `0x99bA8A70d90359e8365deE1bfBccAc5Ef257d8De`

## Repository layout

```
arbiproof/
  contracts/   Foundry project: ReceiptRegistry, BoundedAction, MockERC20, deploy script, tests
  agent/       TypeScript agent: declares intent, executes, anchors the receipt
  verifier/    Vite and React frontend: paste a receipt, get a verdict
```

## Quickstart

### Contracts

```
cd contracts
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge test
```

Deploy to Arbitrum Sepolia. Set `ARBITRUM_SEPOLIA_RPC` and `DEPLOYER_PRIVATE_KEY` in `contracts/.env`, set the AGENT and RECIPIENT addresses in `script/Deploy.s.sol`, then:

```
source .env
forge script script/Deploy.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC --private-key $DEPLOYER_PRIVATE_KEY --broadcast
```

### Agent

Fill `agent/.env` with the deployed addresses and the grant id, then:

```
cd agent
npm install
npm run inscope      # the authorized action: succeeds and anchors a receipt
npm run outofscope   # an out of scope action: blocked onchain, no receipt written
```

### Verifier

```
cd verifier
npm install
npm run dev
```

Open the printed URL and paste a receipt id.


## What is next

An SDK so any agent framework can wrap an action in a grant and emit a receipt in one call. Richer permission policies. Enforcing the bound at the key level with session keys, in addition to the contract level enforcement that exists today. The goal is a standard accountability layer for agents that transact on Arbitrum.

## License

MIT