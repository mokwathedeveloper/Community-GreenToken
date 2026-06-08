/** @jest-environment node */
// Tests for lib/stellar/client.ts — all SDK calls and network are fully mocked.

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/stellar/config", () => ({
  STELLAR_CONFIG: {
    network:           "testnet",
    sorobanRpcUrl:     "https://soroban-testnet.stellar.org",
    horizonUrl:        "https://horizon-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    contracts: {
      greenToken:     "CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH",
      actionRegistry: "CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO",
      rewardManager:  "CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR",
    },
  },
}));

// Capture the mock server instance so tests can program it
const mockGetAccount        = jest.fn();
const mockSimulateTransaction = jest.fn();
const mockSendTransaction   = jest.fn();
const mockGetTransaction    = jest.fn();

const mockRpcServer = {
  getAccount:           mockGetAccount,
  simulateTransaction:  mockSimulateTransaction,
  sendTransaction:      mockSendTransaction,
  getTransaction:       mockGetTransaction,
};

const mockTxBuilderInstance = {
  addOperation: jest.fn().mockReturnThis(),
  setTimeout:   jest.fn().mockReturnThis(),
  build:        jest.fn().mockReturnValue({ type: "mock-tx" }),
};

jest.mock("@stellar/stellar-sdk", () => {
  const GetTransactionStatus = {
    SUCCESS:   "SUCCESS",
    FAILED:    "FAILED",
    NOT_FOUND: "NOT_FOUND",
  };

  return {
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({ type: "horizon-server" })),
    },
    rpc: {
      Server: jest.fn().mockImplementation(() => mockRpcServer),
      Api: {
        GetTransactionStatus,
        isSimulationError: jest.fn().mockReturnValue(false),
      },
      assembleTransaction: jest.fn().mockReturnValue({
        build: jest.fn().mockReturnValue({ type: "assembled-tx" }),
      }),
    },
    TransactionBuilder: Object.assign(
      jest.fn().mockImplementation(() => mockTxBuilderInstance),
      { fromXDR: jest.fn().mockReturnValue({ type: "decoded-tx" }) }
    ),
    Networks: { TESTNET: "Test SDF Network ; September 2015", PUBLIC: "Public Global Stellar Network ; September 2015" },
    BASE_FEE: "100",
    scValToNative: jest.fn().mockReturnValue(BigInt(99)),
  };
});

// ── Imports (after mocks) ────────────────────────────────────────────────────

import {
  buildBaseTx,
  simulateTx,
  assembleTx,
  submitAndWait,
  fundTestnetAccount,
} from "@/lib/stellar/client";
import { rpc, scValToNative } from "@stellar/stellar-sdk";

const mockScValToNative      = scValToNative as jest.Mock;
const mockIsSimulationError  = rpc.Api.isSimulationError as unknown as jest.Mock;
const mockAssembleTransaction = (rpc.assembleTransaction as jest.Mock);

// ── buildBaseTx ──────────────────────────────────────────────────────────────

describe("buildBaseTx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccount.mockResolvedValue({ id: "GABC", sequence: "100" });
  });

  it("calls server.getAccount with the given public key", async () => {
    const pubkey = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";
    await buildBaseTx(pubkey);
    expect(mockGetAccount).toHaveBeenCalledWith(pubkey);
  });

  it("returns a TransactionBuilder", async () => {
    const builder = await buildBaseTx("GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ");
    expect(builder).toBeDefined();
    expect(typeof builder.addOperation).toBe("function");
  });

  it("propagates getAccount errors", async () => {
    mockGetAccount.mockRejectedValue(new Error("Account not found"));
    await expect(
      buildBaseTx("GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ")
    ).rejects.toThrow("Account not found");
  });
});

// ── simulateTx ───────────────────────────────────────────────────────────────

describe("simulateTx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls server.simulateTransaction with the tx", async () => {
    const mockTx  = { type: "tx" } as any;
    const mockSim = { result: { retval: {} } };
    mockSimulateTransaction.mockResolvedValue(mockSim);

    const result = await simulateTx(mockTx);
    expect(mockSimulateTransaction).toHaveBeenCalledWith(mockTx);
    expect(result).toBe(mockSim);
  });

  it("propagates simulation errors", async () => {
    mockSimulateTransaction.mockRejectedValue(new Error("RPC unreachable"));
    await expect(simulateTx({ type: "tx" } as any)).rejects.toThrow("RPC unreachable");
  });
});

// ── assembleTx ───────────────────────────────────────────────────────────────

describe("assembleTx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("throws when simulation result is an error", () => {
    mockIsSimulationError.mockReturnValueOnce(true);
    const simError = { error: "auth failure" };
    expect(() => assembleTx({ type: "tx" } as any, simError as any)).toThrow("Simulation failed");
  });

  it("returns an assembled transaction on success", () => {
    mockIsSimulationError.mockReturnValueOnce(false);
    const builtTx = { type: "assembled-tx" };
    mockAssembleTransaction.mockReturnValueOnce({ build: jest.fn().mockReturnValue(builtTx) });

    const result = assembleTx({ type: "tx" } as any, { result: {} } as any);
    expect(result).toBe(builtTx);
  });

  it("calls rpc.assembleTransaction with (tx, simResult)", () => {
    mockIsSimulationError.mockReturnValueOnce(false);
    const tx  = { type: "tx" } as any;
    const sim = { result: {} } as any;
    assembleTx(tx, sim);
    expect(mockAssembleTransaction).toHaveBeenCalledWith(tx, sim);
  });
});

// ── submitAndWait ─────────────────────────────────────────────────────────────

describe("submitAndWait — SUCCESS path", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns SUCCESS status and txHash when transaction confirms", async () => {
    mockSendTransaction.mockResolvedValue({ hash: "abc123" });
    mockGetTransaction.mockResolvedValue({
      status: "SUCCESS",
      ledger: 42,
    });

    const result = await submitAndWait("mock-signed-xdr");
    expect(result.status).toBe("SUCCESS");
    expect(result.txHash).toBe("abc123");
    expect(result.ledger).toBe(42);
  });

  it("parses returnValue from Soroban result meta", async () => {
    mockSendTransaction.mockResolvedValue({ hash: "hash-with-return" });
    mockScValToNative.mockReturnValue(BigInt(7));

    const mockRetval = { type: "scval" };
    mockGetTransaction.mockResolvedValue({
      status:        "SUCCESS",
      ledger:        10,
      resultMetaXdr: {
        v3: () => ({
          sorobanMeta: () => ({
            returnValue: () => mockRetval,
          }),
        }),
      },
    });

    const result = await submitAndWait("mock-signed-xdr");
    expect(result.returnValue).toBe(BigInt(7));
    expect(mockScValToNative).toHaveBeenCalledWith(mockRetval);
  });

  it("sets returnValue to null when resultMetaXdr is missing", async () => {
    mockSendTransaction.mockResolvedValue({ hash: "no-meta-hash" });
    mockGetTransaction.mockResolvedValue({ status: "SUCCESS", ledger: 1 });

    const result = await submitAndWait("xdr");
    expect(result.returnValue).toBeNull();
  });

  it("sets returnValue to null when sorobanMeta is missing", async () => {
    mockSendTransaction.mockResolvedValue({ hash: "no-soroban-hash" });
    mockGetTransaction.mockResolvedValue({
      status:        "SUCCESS",
      ledger:        1,
      resultMetaXdr: { v3: () => null },
    });

    const result = await submitAndWait("xdr");
    expect(result.returnValue).toBeNull();
  });

  it("sets returnValue to null when scValToNative throws", async () => {
    mockSendTransaction.mockResolvedValue({ hash: "parse-fail-hash" });
    mockScValToNative.mockImplementationOnce(() => { throw new Error("parse error"); });
    mockGetTransaction.mockResolvedValue({
      status:        "SUCCESS",
      ledger:        1,
      resultMetaXdr: {
        v3: () => ({
          sorobanMeta: () => ({
            returnValue: () => ({ type: "scval" }),
          }),
        }),
      },
    });

    const result = await submitAndWait("xdr");
    expect(result.returnValue).toBeNull();
  });
});

describe("submitAndWait — FAILED path", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns FAILED status when transaction fails on-chain", async () => {
    mockSendTransaction.mockResolvedValue({ hash: "fail-hash" });
    mockGetTransaction.mockResolvedValue({ status: "FAILED", ledger: 5 });

    const result = await submitAndWait("mock-signed-xdr");
    expect(result.status).toBe("FAILED");
    expect(result.txHash).toBe("fail-hash");
  });

  it("returns FAILED with timeout message after max polls", async () => {
    jest.useFakeTimers();
    mockSendTransaction.mockResolvedValue({ hash: "timeout-hash" });
    mockGetTransaction.mockResolvedValue({ status: "NOT_FOUND" });

    const promise = submitAndWait("mock-signed-xdr");
    await jest.runAllTimersAsync();
    const result = await promise;

    jest.useRealTimers();
    expect(result.status).toBe("FAILED");
    expect(result.errorMessage).toContain("timeout");
  });
});

// ── fundTestnetAccount ────────────────────────────────────────────────────────

describe("fundTestnetAccount", () => {
  const PUBKEY = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";

  it("calls the Friendbot endpoint on testnet and returns true on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const result = await fundTestnetAccount(PUBKEY);
    expect(result).toBe(true);
    expect((global.fetch as jest.Mock)).toHaveBeenCalledWith(
      expect.stringContaining("friendbot.stellar.org"),
      expect.any(Object)
    );
  });

  it("returns false on Friendbot HTTP error", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const result = await fundTestnetAccount(PUBKEY);
    expect(result).toBe(false);
  });

  it("returns false when fetch throws (network error)", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    const result = await fundTestnetAccount(PUBKEY);
    expect(result).toBe(false);
  });

  it("encodes the public key in the Friendbot URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await fundTestnetAccount(PUBKEY);
    const calledUrl = ((global.fetch as jest.Mock).mock.calls[0][0] as string);
    expect(calledUrl).toContain(encodeURIComponent(PUBKEY));
  });
});
