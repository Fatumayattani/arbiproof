import {
  createPublicClient, createWalletClient, http, keccak256, toHex,
  type Address, type PublicClient, type WalletClient
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { registryAbi } from "./abi.js";
import { verifyReceipt } from "./verify.js";
import { hashIntent } from "./intent.js";
import { DEFAULT_REGISTRY, DEFAULT_RPC, DEFAULT_CHAIN } from "./constants.js";
import type {
  ArbiProofConfig, Grant, Receipt, Verdict, RegisterGrantParams, ProveParams
} from "./types.js";

export class ArbiProof {
  readonly registry: Address;
  readonly publicClient: PublicClient;
  private wallet?: WalletClient;
  private account?: ReturnType<typeof privateKeyToAccount>;

  constructor(config: ArbiProofConfig = {}) {
    this.registry = (config.registry ?? DEFAULT_REGISTRY) as Address;
    const transport = http(config.rpcUrl ?? DEFAULT_RPC);
    this.publicClient = createPublicClient({ chain: DEFAULT_CHAIN, transport });

    if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey);
      this.wallet = createWalletClient({ account: this.account, chain: DEFAULT_CHAIN, transport });
    }
  }

  private requireWallet() {
    if (!this.wallet || !this.account) {
      throw new Error("This method needs a privateKey. Create the client with { privateKey }.");
    }
    return { wallet: this.wallet, account: this.account };
  }

  /// Authorizer: register what an agent is allowed to do.
  async registerGrant(p: RegisterGrantParams): Promise<`0x${string}`> {
    const { wallet, account } = this.requireWallet();
    const hash = await wallet.writeContract({
      account, chain: DEFAULT_CHAIN, address: this.registry, abi: registryAbi,
      functionName: "registerGrant",
      args: [p.grantId, p.agent, p.target, p.selector, p.recipient, p.maxAmount, p.expiry]
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  /// Agent: anchor a receipt binding grant, intent, and the action tx.
  async recordReceipt(params: {
    grantId: `0x${string}`;
    intentHash: `0x${string}`;
    txRef: `0x${string}`;
  }): Promise<`0x${string}`> {
    const { wallet, account } = this.requireWallet();
    const receiptId = keccak256(toHex(`${params.grantId}:${params.txRef}`));
    const hash = await wallet.writeContract({
      account, chain: DEFAULT_CHAIN, address: this.registry, abi: registryAbi,
      functionName: "recordReceipt",
      args: [receiptId, params.grantId, params.intentHash, params.txRef]
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return receiptId;
  }

  /// Agent: declare intent, run the action, anchor the receipt. One call.
  async prove(p: ProveParams): Promise<{ receiptId: `0x${string}`; txHash: `0x${string}` }> {
    this.requireWallet();
    const intentHash = hashIntent(p.intent);
    const txHash = await p.action();
    const receiptId = await this.recordReceipt({ grantId: p.grantId, intentHash, txRef: txHash });
    return { receiptId, txHash };
  }

  /// Anyone: recompute the verdict for a receipt from chain.
  verify(receiptId: `0x${string}`): Promise<Verdict> {
    return verifyReceipt(this.publicClient, this.registry, receiptId);
  }

  async getReceipt(receiptId: `0x${string}`): Promise<Receipt> {
    return await this.publicClient.readContract({
      address: this.registry, abi: registryAbi, functionName: "getReceipt", args: [receiptId]
    }) as Receipt;
  }

  async getGrant(grantId: `0x${string}`): Promise<Grant> {
    return await this.publicClient.readContract({
      address: this.registry, abi: registryAbi, functionName: "getGrant", args: [grantId]
    }) as Grant;
  }
}
