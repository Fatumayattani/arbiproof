# contracts

Foundry project for ArbiProof.

## Setup

forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build

## Deploy to Arbitrum Sepolia

source .env
forge script script/Deploy.s.sol \
  --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast --verify

## Files

ReceiptRegistry.sol  Grants plus receipts. The authorizer registers a grant.
                     The agent records a receipt referencing that grant.
BoundedAction.sol    Demo target. Enforces allowlist plus per call cap and
                     reverts on any out of scope call. This is what makes the
                     rejection demo real even without the session key.
MockERC20.sol        Test token the agent moves in the demo.
