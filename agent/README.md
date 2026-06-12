# agent

The ArbiProof agent. It declares an intent, executes an action through a scoped
authority, then anchors a receipt onchain.

## Run

npm install
cp .env.example .env   # fill it in
npm run inscope        # happy path: action succeeds, receipt PASS
npm run outofscope     # the action is blocked, this is the demo money shot

## Modules

config.ts       env, chain, clients
intent.ts       declare and hash the intent
sessionKey.ts   ZeroDev scoped session key (primary path). TODO wire SDK.
executor.ts     execute the action via the session key, or plain key fallback
receipt.ts      write the receipt to the registry
abis.ts         minimal ABIs for registry and action
runInScope.ts   orchestrates the allowed action
runOutOfScope.ts demonstrates the bound by attempting a blocked action
