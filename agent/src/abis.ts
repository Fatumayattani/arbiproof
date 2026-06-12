export const registryAbi = [
  {
    type: "function",
    name: "recordReceipt",
    stateMutability: "nonpayable",
    inputs: [
      { name: "receiptId", type: "bytes32" },
      { name: "grantId", type: "bytes32" },
      { name: "intentHash", type: "bytes32" },
      { name: "txRef", type: "bytes32" }
    ],
    outputs: []
  }
] as const;

export const actionAbi = [
  {
    type: "function",
    name: "execute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;
