// ZeroDev scoped session key. PRIMARY authority path.
//
// The agent should hold ONLY a session key that can call BoundedAction.execute
// with the allowlisted recipient and under the cap. Anything else is rejected
// before it ever reaches the chain.
//
// This is the riskiest piece to wire, so build and test it first. If the policy
// fights you past about three hours, fall back to executor.ts plainKey path:
// BoundedAction enforces the same bounds onchain and still reverts out of scope,
// so the demo holds either way.
//
// Wiring outline (check current ZeroDev docs for exact imports and policy api):
//   1. create a kernel smart account from the owner key
//   2. create a session key signer
//   3. install a permission validator with a call policy:
//        target   = BOUNDED_ACTION_ADDRESS
//        selector = execute(address,uint256)
//        plus a param constraint pinning recipient and a value cap if available
//   4. return a kernel client the executor can send the in scope call through
//
// Keep the surface tiny: one function that returns something with a
// sendTransaction style method.

export interface ScopedClient {
  // TODO replace with the real ZeroDev kernel client type once wired
  sendScopedExecute(recipient: `0x${string}`, amount: bigint): Promise<`0x${string}`>;
}

export async function createScopedClient(): Promise<ScopedClient> {
  // TODO implement with ZeroDev SDK. Throw until wired so we never silently
  // fall through to an unscoped path by accident.
  throw new Error("ZeroDev session key not wired yet. Use executor plainKey fallback for now.");
}
