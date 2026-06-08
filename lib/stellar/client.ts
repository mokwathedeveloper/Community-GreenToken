// Rule R-SDK-03: MUST use rpc.Server for contract calls, Horizon.Server for accounts
// Rule R-SDK-04: MUST simulate before submitting
// Spec: architecture/stellar_sdk_api_spec.md Section 2

import {
  Horizon,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  type Transaction,
  type FeeBumpTransaction,
} from "@stellar/stellar-sdk";
import { STELLAR_CONFIG } from "./config";

// ── Server instances (lazily initialized) ─────────────────────────────────────
let _sorobanServer: rpc.Server | null = null;
let _horizonServer: Horizon.Server  | null = null;

export function getSorobanServer(): rpc.Server {
  if (!_sorobanServer) {
    _sorobanServer = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl, {
      allowHttp: STELLAR_CONFIG.network === "testnet",
    });
  }
  return _sorobanServer;
}

export function getHorizonServer(): Horizon.Server {
  if (!_horizonServer) {
    _horizonServer = new Horizon.Server(STELLAR_CONFIG.horizonUrl, {
      allowHttp: STELLAR_CONFIG.network === "testnet",
    });
  }
  return _horizonServer;
}

// ── Transaction builder helper ────────────────────────────────────────────────

/**
 * Build a base transaction for the given source account.
 * Rule R-SDK-04: caller MUST simulate before submitting.
 */
export async function buildBaseTx(sourcePublicKey: string): Promise<TransactionBuilder> {
  const server  = getSorobanServer();
  const account = await server.getAccount(sourcePublicKey);
  const network = STELLAR_CONFIG.network === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;

  return new TransactionBuilder(account, {
    fee:           BASE_FEE,
    networkPassphrase: network,
  });
}

// ── Simulation ────────────────────────────────────────────────────────────────

/**
 * Simulate a transaction — MUST be called before submitTx.
 * Returns the simulation result with updated fee and footprint.
 */
export async function simulateTx(
  tx: Transaction | FeeBumpTransaction
): Promise<rpc.Api.SimulateTransactionResponse> {
  const server = getSorobanServer();
  return server.simulateTransaction(tx);
}

/**
 * Assemble a transaction with the simulated footprint and fee.
 * Rule R-SDK-04: simulation result applied before signing.
 */
export function assembleTx(
  tx: Transaction,
  simResult: rpc.Api.SimulateTransactionResponse
): Transaction {
  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }
  return rpc.assembleTransaction(tx, simResult).build();
}

// ── Submit ────────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS        = 15;

export interface TxResult {
  txHash:        string;
  status:        "SUCCESS" | "FAILED";
  ledger:        number;
  errorMessage?: string;
}

/**
 * Submit a signed XDR and poll for confirmation.
 * Rule R-SDK-05: MUST handle PENDING → SUCCESS/FAILED states.
 * Rule R-SDK-06: exponential backoff polling (max 30s).
 */
export async function submitAndWait(signedXdr: string): Promise<TxResult> {
  const server = getSorobanServer();
  const { hash } = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, STELLAR_CONFIG.networkPassphrase) as Transaction
  );

  let polls = 0;
  let delay = POLL_INTERVAL_MS;

  while (polls < MAX_POLLS) {
    await new Promise((r) => setTimeout(r, delay));
    const result = await server.getTransaction(hash);

    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return { txHash: hash, status: "SUCCESS", ledger: result.ledger };
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      return { txHash: hash, status: "FAILED", ledger: result.ledger, errorMessage: "Transaction failed on-chain" };
    }
    // Still pending — exponential backoff up to 8s
    delay = Math.min(delay * 1.5, 8000);
    polls++;
  }

  return { txHash: hash, status: "FAILED", ledger: 0, errorMessage: "Transaction confirmation timeout" };
}

// ── Friendbot (testnet only) ──────────────────────────────────────────────────

export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  if (STELLAR_CONFIG.network !== "testnet") return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}
