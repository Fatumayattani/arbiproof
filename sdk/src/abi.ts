export const registryAbi = [
  {
    type: "function", name: "registerGrant", stateMutability: "nonpayable",
    inputs: [
      { name: "grantId", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "target", type: "address" },
      { name: "selector", type: "bytes4" },
      { name: "recipient", type: "address" },
      { name: "maxAmount", type: "uint256" },
      { name: "expiry", type: "uint64" }
    ],
    outputs: []
  },
  {
    type: "function", name: "recordReceipt", stateMutability: "nonpayable",
    inputs: [
      { name: "receiptId", type: "bytes32" },
      { name: "grantId", type: "bytes32" },
      { name: "intentHash", type: "bytes32" },
      { name: "txRef", type: "bytes32" }
    ],
    outputs: []
  },
  {
    type: "function", name: "getReceipt", stateMutability: "view",
    inputs: [{ name: "receiptId", type: "bytes32" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "grantId", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "intentHash", type: "bytes32" },
      { name: "txRef", type: "bytes32" },
      { name: "timestamp", type: "uint256" },
      { name: "exists", type: "bool" }
    ]}]
  },
  {
    type: "function", name: "getGrant", stateMutability: "view",
    inputs: [{ name: "grantId", type: "bytes32" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "agent", type: "address" },
      { name: "target", type: "address" },
      { name: "selector", type: "bytes4" },
      { name: "recipient", type: "address" },
      { name: "maxAmount", type: "uint256" },
      { name: "expiry", type: "uint64" },
      { name: "exists", type: "bool" }
    ]}]
  }
] as const;

/// The default action shape the registry grants describe: execute(address,uint256).
export const actionAbi = [
  {
    type: "function", name: "execute", stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: []
  }
] as const;
