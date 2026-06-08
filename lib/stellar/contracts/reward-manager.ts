// RewardManager contract client
// Spec: architecture/stellar_sdk_api_spec.md Section 7
// Rule R-FRQ-05: user MUST sign redemption transactions (not the platform)

import {
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import { STELLAR_CONFIG, getTxExplorerUrl } from "../config";
import { buildBaseTx, simulateTx, assembleTx, submitAndWait, type TxResult } from "../client";

function getContract(): Contract {
  const id = STELLAR_CONFIG.contracts.rewardManager;
  if (!id) throw new Error("REWARD_MANAGER_CONTRACT_ID not configured.");
  return new Contract(id);
}

// ── Read functions ────────────────────────────────────────────────────────

export async function getTotalBurned(): Promise<bigint> {
  const { getSorobanServer: getServer } = await import("../client");
  const server   = getServer();
  const contract = getContract();
  const dummyKey = STELLAR_CONFIG.contracts.rewardManager;

  const tx = (await buildBaseTx(dummyKey))
    .addOperation(contract.call("total_burned"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!("result" in sim) || !sim.result) return BigInt(0);
  return BigInt(scValToNative(sim.result.retval) ?? 0);
}

// ── Build unsigned redeem transaction for user to sign ────────────────────

/**
 * Build an unsigned redemption transaction XDR.
 * Rule R-FRQ-05: User MUST sign this with their own Freighter wallet.
 * The platform NEVER calls this — the frontend hands it to Freighter.
 */
export async function buildRedeemTx(
  userAddress: string,
  rewardId:    number
): Promise<string> {
  const contract = getContract();

  const tx = (await buildBaseTx(userAddress))
    .addOperation(contract.call(
      "redeem_reward",
      new Address(userAddress).toScVal(),
      nativeToScVal(rewardId, { type: "u32" })
    ))
    .setTimeout(30)
    .build();

  const sim       = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  return assembled.toXDR();  // Unsigned — user signs with Freighter
}

/**
 * Submit a user-signed redemption XDR.
 * The signed XDR comes from the frontend after Freighter signing.
 */
export async function redeemReward(
  signedXdr: string
): Promise<{ redemptionId: bigint } & TxResult & { explorerUrl: string }> {
  const result = await submitAndWait(signedXdr);
  return { redemptionId: result.returnValue ?? BigInt(0), ...result, explorerUrl: getTxExplorerUrl(result.txHash) };
}

// ── Admin: add reward to catalog ─────────────────────────────────────────

export async function addReward(
  adminSecret:  string,
  rewardId:     number,
  name:         string,
  description:  string,
  tokenCost:    bigint,
  totalSupply:  number | null,
  orgId:        string
): Promise<TxResult & { explorerUrl: string }> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const adminKp  = Keypair.fromSecret(adminSecret);
  const contract = getContract();
  const orgBytes = Buffer.from(orgId.replace(/-/g, "").padEnd(64, "0").slice(0, 64), "hex");

  const tx = (await buildBaseTx(adminKp.publicKey()))
    .addOperation(contract.call(
      "add_reward",
      new Address(adminKp.publicKey()).toScVal(),
      nativeToScVal(rewardId,     { type: "u32" }),
      nativeToScVal(name,         { type: "string" }),
      nativeToScVal(description,  { type: "string" }),
      nativeToScVal(tokenCost,    { type: "i128" }),
      totalSupply !== null
        ? xdr.ScVal.scvVec([nativeToScVal(totalSupply, { type: "u32" })])  // Some(n)
        : xdr.ScVal.scvVoid(),                                              // None
      xdr.ScVal.scvBytes(orgBytes),
    ))
    .setTimeout(30)
    .build();

  const sim       = await simulateTx(tx);
  const assembled = assembleTx(tx, sim);
  assembled.sign(adminKp);

  const result = await submitAndWait(assembled.toXDR());
  return { ...result, explorerUrl: getTxExplorerUrl(result.txHash) };
}
