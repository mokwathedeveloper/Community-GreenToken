// GreenToken contract client
// Spec: architecture/stellar_sdk_api_spec.md Section 5
// Rule R-SDK-04: MUST simulate before any state-changing call
// Rule R-SDK-08: MUST convert stroops ↔ display GTK

import {
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
} from "@stellar/stellar-sdk";
import { STELLAR_CONFIG, getTxExplorerUrl } from "../config";
import {
  getSorobanServer,
  buildBaseTx,
  simulateTx,
  assembleTx,
  submitAndWait,
  type TxResult,
} from "../client";
import { fromStroops } from "@/lib/utils";

function getContract(): Contract {
  const id = STELLAR_CONFIG.contracts.greenToken;
  if (!id) throw new Error("GREEN_TOKEN_CONTRACT_ID not configured.");
  return new Contract(id);
}

// ── Read functions ──────────────────────────────────────────────────────────

/** Get GTK balance in stroops */
export async function getBalance(walletAddress: string): Promise<bigint> {
  const server   = getSorobanServer();
  const contract = getContract();
  const tx = (await buildBaseTx(walletAddress))
    .addOperation(contract.call("balance", new Address(walletAddress).toScVal()))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!("result" in sim) || !sim.result) return BigInt(0);

  return BigInt(scValToNative(sim.result.retval) ?? 0);
}

/** Get display balance (GTK, 7 decimals) */
export async function getDisplayBalance(walletAddress: string): Promise<number> {
  const stroops = await getBalance(walletAddress);
  return fromStroops(stroops);
}

export async function getName(): Promise<string> {
  const server   = getSorobanServer();
  const contract = getContract();
  const dummyKey = STELLAR_CONFIG.contracts.greenToken;
  const tx = (await buildBaseTx(dummyKey))
    .addOperation(contract.call("name"))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (!("result" in sim) || !sim.result) return "GreenToken";
  return scValToNative(sim.result.retval) ?? "GreenToken";
}

export async function getSymbol(): Promise<string> {
  const server   = getSorobanServer();
  const contract = getContract();
  const dummyKey = STELLAR_CONFIG.contracts.greenToken;
  const tx = (await buildBaseTx(dummyKey))
    .addOperation(contract.call("symbol"))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (!("result" in sim) || !sim.result) return "GTK";
  return scValToNative(sim.result.retval) ?? "GTK";
}

// ── Admin write functions (server-side, signed with admin keypair) ─────────

/**
 * Mint GTK tokens to a user.
 * Rule R-SDK-07: admin secret key NEVER sent to frontend.
 * Rule R-SC-09: minting happens through ActionRegistry — this is for emergency/admin use only.
 */
export async function mint(
  adminSecret: string,
  toAddress:   string,
  amount:      bigint
): Promise<TxResult & { explorerUrl: string }> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const adminKp  = Keypair.fromSecret(adminSecret);
  const contract = getContract();

  const tx = (await buildBaseTx(adminKp.publicKey()))
    .addOperation(contract.call(
      "mint",
      new Address(adminKp.publicKey()).toScVal(),
      new Address(toAddress).toScVal(),
      nativeToScVal(amount, { type: "i128" })
    ))
    .setTimeout(30)
    .build();

  const sim      = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  assembled.sign(adminKp);

  const result = await submitAndWait(assembled.toXDR());
  return { ...result, explorerUrl: getTxExplorerUrl(result.txHash) };
}

/** Build unsigned burn XDR — user signs with Freighter wallet */
export async function buildBurnTx(
  userAddress: string,
  amount:      bigint
): Promise<string> {
  const contract = getContract();
  const tx = (await buildBaseTx(userAddress))
    .addOperation(contract.call(
      "burn",
      new Address(userAddress).toScVal(),
      nativeToScVal(amount, { type: "i128" })
    ))
    .setTimeout(30)
    .build();

  const sim      = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  return assembled.toXDR();
}

/**
 * Build unsigned burn_from XDR — spender uses an approved allowance to burn
 * tokens from `fromAddress`. Required by SEP-41.
 * The spender signs this transaction with Freighter.
 */
export async function buildBurnFromTx(
  spenderAddress: string,
  fromAddress:    string,
  amount:         bigint
): Promise<string> {
  const contract = getContract();
  const tx = (await buildBaseTx(spenderAddress))
    .addOperation(contract.call(
      "burn_from",
      new Address(spenderAddress).toScVal(),
      new Address(fromAddress).toScVal(),
      nativeToScVal(amount, { type: "i128" })
    ))
    .setTimeout(30)
    .build();

  const sim      = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  return assembled.toXDR();
}
