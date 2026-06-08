// ActionRegistry contract client
// Spec: architecture/stellar_sdk_api_spec.md Section 6
// Rule R-SC-09: minting ONLY through ActionRegistry.verify_action cross-contract call

import {
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import { STELLAR_CONFIG, getTxExplorerUrl } from "../config";
import { buildBaseTx, simulateTx, assembleTx, submitAndWait, type TxResult } from "../client";
import { type ActionType } from "../types";

function getContract(): Contract {
  const id = STELLAR_CONFIG.contracts.actionRegistry;
  if (!id) throw new Error("ACTION_REGISTRY_CONTRACT_ID not configured.");
  return new Contract(id);
}

/** Convert ActionType string to Soroban enum ScVal */
function actionTypeToScVal(actionType: ActionType) {
  return xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(actionType)]);
}

// ── Submit action (platform-signed, server-side) ─────────────────────────────

export interface SubmitActionResult {
  actionId: bigint;
  txHash:   string;
  explorerUrl: string;
}

/**
 * Submit an eco-action to the ActionRegistry on Stellar.
 * Platform admin signs this — NOT the user.
 */
export async function submitAction(
  adminSecret:   string,
  userAddress:   string,
  actionType:    ActionType,
  description:   string,
  evidenceHash:  string,  // 64-char hex
  orgId:         string   // 64-char hex
): Promise<SubmitActionResult> {
  const { Keypair, xdr: xdrSdk } = await import("@stellar/stellar-sdk");
  const adminKp  = Keypair.fromSecret(adminSecret);
  const contract = getContract();

  // Convert evidenceHash hex → BytesN<32>
  const hashBytes = Buffer.from(evidenceHash, "hex");
  const orgBytes  = Buffer.from(orgId.replace(/-/g, "").padEnd(64, "0").slice(0, 64), "hex");

  const tx = (await buildBaseTx(adminKp.publicKey()))
    .addOperation(contract.call(
      "submit_action",
      new Address(userAddress).toScVal(),
      actionTypeToScVal(actionType),
      nativeToScVal(description, { type: "string" }),
      xdrSdk.ScVal.scvBytes(hashBytes),
      xdrSdk.ScVal.scvBytes(orgBytes),
    ))
    .setTimeout(30)
    .build();

  const sim       = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  assembled.sign(adminKp);

  const result  = await submitAndWait(assembled.toXDR());
  // Extract action_id from simulation return value
  const actionId = BigInt(0); // TODO: parse from sim result retval

  return { actionId, txHash: result.txHash, explorerUrl: getTxExplorerUrl(result.txHash) };
}

// ── Verify action (admin-signed, triggers cross-contract GTK mint) ─────────

export async function verifyAction(
  adminSecret: string,
  actionId:    bigint,
  tokens:      bigint  // in stroops
): Promise<TxResult & { explorerUrl: string }> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const adminKp  = Keypair.fromSecret(adminSecret);
  const contract = getContract();

  const tx = (await buildBaseTx(adminKp.publicKey()))
    .addOperation(contract.call(
      "verify_action",
      new Address(adminKp.publicKey()).toScVal(),
      nativeToScVal(actionId, { type: "u64" }),
      nativeToScVal(tokens,   { type: "i128" })
    ))
    .setTimeout(30)
    .build();

  const sim       = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  assembled.sign(adminKp);

  const result = await submitAndWait(assembled.toXDR());
  return { ...result, explorerUrl: getTxExplorerUrl(result.txHash) };
}

// ── Reject action ─────────────────────────────────────────────────────────

export async function rejectAction(
  adminSecret: string,
  actionId:    bigint
): Promise<TxResult & { explorerUrl: string }> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const adminKp  = Keypair.fromSecret(adminSecret);
  const contract = getContract();

  const tx = (await buildBaseTx(adminKp.publicKey()))
    .addOperation(contract.call(
      "reject_action",
      new Address(adminKp.publicKey()).toScVal(),
      nativeToScVal(actionId, { type: "u64" })
    ))
    .setTimeout(30)
    .build();

  const sim       = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  assembled.sign(adminKp);

  const result = await submitAndWait(assembled.toXDR());
  return { ...result, explorerUrl: getTxExplorerUrl(result.txHash) };
}

// ── Read functions ────────────────────────────────────────────────────────

export async function getActionCount(): Promise<bigint> {
  const { getSorobanServer: getServer } = await import("../client");
  const server   = getServer();
  const contract = getContract();
  const dummyKey = STELLAR_CONFIG.contracts.actionRegistry;

  const tx = (await buildBaseTx(dummyKey))
    .addOperation(contract.call("action_count"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!("result" in sim) || !sim.result) return BigInt(0);
  return BigInt(scValToNative(sim.result.retval) ?? 0);
}
