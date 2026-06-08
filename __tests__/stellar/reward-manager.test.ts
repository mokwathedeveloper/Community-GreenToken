/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Tests for lib/stellar/contracts/reward-manager.ts — all SDK and network calls mocked.

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/stellar/config", () => ({
  STELLAR_CONFIG: {
    network:           "testnet",
    sorobanRpcUrl:     "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    contracts: {
      greenToken:    "CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH",
      actionRegistry:"CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO",
      rewardManager: "CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR",
    },
  },
  getTxExplorerUrl: (hash: string) =>
    `https://stellar.expert/explorer/testnet/tx/${hash}`,
}));

jest.mock("@/lib/stellar/client", () => ({
  buildBaseTx:      jest.fn(),
  simulateTx:       jest.fn(),
  assembleTx:       jest.fn(),
  submitAndWait:    jest.fn(),
  getSorobanServer: jest.fn(),
}));

const mockContractCall = jest.fn().mockReturnValue({ type: "mock-operation" });

jest.mock("@stellar/stellar-sdk", () => ({
  Contract: jest.fn().mockImplementation(() => ({
    call: mockContractCall,
  })),
  Address: jest.fn().mockImplementation((addr: string) => {
    if (!addr || (!addr.startsWith("G") && !addr.startsWith("C"))) {
      throw new Error(`Invalid account ID: ${addr}`);
    }
    return { toScVal: jest.fn().mockReturnValue({ type: "mock-address-scval" }) };
  }),
  nativeToScVal: jest.fn().mockReturnValue({ type: "mock-scval" }),
  scValToNative: jest.fn().mockReturnValue(BigInt(0)),
  xdr: {
    ScVal: {
      scvVec:  jest.fn().mockReturnValue({ type: "mock-vec" }),
      scvVoid: jest.fn().mockReturnValue({ type: "mock-void" }),
      scvBytes: jest.fn().mockReturnValue({ type: "mock-bytes" }),
    },
  },
  Keypair: {
    fromSecret: jest.fn().mockReturnValue({
      publicKey: jest.fn().mockReturnValue(
        "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ"
      ),
      sign: jest.fn(),
    }),
  },
  TransactionBuilder: {
    fromXDR: jest.fn().mockReturnValue({ type: "decoded-tx" }),
  },
}));

// ── Imports (after mocks) ────────────────────────────────────────────────────

import { redeemReward, buildRedeemTx, addReward, getTotalBurned } from "@/lib/stellar/contracts/reward-manager";
import { buildBaseTx, simulateTx, assembleTx, submitAndWait, getSorobanServer } from "@/lib/stellar/client";

const mockBuildBaseTx   = buildBaseTx   as jest.Mock;
const mockSimulateTx    = simulateTx    as jest.Mock;
const mockAssembleTx    = assembleTx    as jest.Mock;
const mockSubmitAndWait = submitAndWait as jest.Mock;
const mockGetServer     = getSorobanServer as jest.Mock;

const ADMIN_SECRET = "SDOKNR6XS6S66VA2KAT6I3GRW3HHJYLJFPTYHWQAID5UYP5BRD2JJW5A";
const USER_ADDRESS = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";

function makeTxBuilder() {
  return {
    addOperation: jest.fn().mockReturnThis(),
    setTimeout:   jest.fn().mockReturnThis(),
    build:        jest.fn().mockReturnValue({ type: "mock-tx" }),
  };
}

function makeAssembled() {
  return {
    sign:  jest.fn(),
    toXDR: jest.fn().mockReturnValue("assembled-xdr"),
  };
}

// ── redeemReward ─────────────────────────────────────────────────────────────

describe("redeemReward — happy path", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitAndWait.mockResolvedValue({
      txHash:      "redeem-tx-hash",
      status:      "SUCCESS",
      ledger:      55,
      returnValue: BigInt(12),
    });
  });

  it("returns txHash from submitAndWait", async () => {
    const result = await redeemReward("signed-xdr");
    expect(result.txHash).toBe("redeem-tx-hash");
  });

  it("returns explorerUrl derived from txHash", async () => {
    const result = await redeemReward("signed-xdr");
    expect(result.explorerUrl).toBe(
      "https://stellar.expert/explorer/testnet/tx/redeem-tx-hash"
    );
  });

  it("uses returnValue from TxResult as redemptionId", async () => {
    const result = await redeemReward("signed-xdr");
    expect(result.redemptionId).toBe(BigInt(12));
  });

  it("passes the signedXdr directly to submitAndWait", async () => {
    await redeemReward("my-signed-xdr");
    expect(mockSubmitAndWait).toHaveBeenCalledWith("my-signed-xdr");
  });
});

describe("redeemReward — redemptionId fallback", () => {
  beforeEach(() => jest.clearAllMocks());

  it("falls back to BigInt(0) when returnValue is null", async () => {
    mockSubmitAndWait.mockResolvedValue({
      txHash: "no-return-hash", status: "SUCCESS", ledger: 1, returnValue: null,
    });
    const result = await redeemReward("signed-xdr");
    expect(result.redemptionId).toBe(BigInt(0));
  });

  it("falls back to BigInt(0) when returnValue is undefined", async () => {
    mockSubmitAndWait.mockResolvedValue({
      txHash: "no-return-hash", status: "SUCCESS", ledger: 1,
    });
    const result = await redeemReward("signed-xdr");
    expect(result.redemptionId).toBe(BigInt(0));
  });

  it("propagates submitAndWait errors", async () => {
    mockSubmitAndWait.mockRejectedValue(new Error("Stellar network error"));
    await expect(redeemReward("signed-xdr")).rejects.toThrow("Stellar network error");
  });
});

// ── buildRedeemTx ─────────────────────────────────────────────────────────────

describe("buildRedeemTx", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const builder  = makeTxBuilder();
    const assembled = makeAssembled();
    mockBuildBaseTx.mockResolvedValue(builder);
    mockSimulateTx.mockResolvedValue({ result: { retval: {} } });
    mockAssembleTx.mockReturnValue(assembled);
  });

  it("returns an XDR string", async () => {
    const xdr = await buildRedeemTx(USER_ADDRESS, 1);
    expect(typeof xdr).toBe("string");
    expect(xdr.length).toBeGreaterThan(0);
  });

  it("calls buildBaseTx with the user address", async () => {
    await buildRedeemTx(USER_ADDRESS, 5);
    expect(mockBuildBaseTx).toHaveBeenCalledWith(USER_ADDRESS);
  });

  it("calls simulateTx before assembling", async () => {
    await buildRedeemTx(USER_ADDRESS, 5);
    expect(mockSimulateTx).toHaveBeenCalledTimes(1);
    expect(mockAssembleTx).toHaveBeenCalledTimes(1);
  });

  it("does NOT call submitAndWait — this is unsigned tx for Freighter", async () => {
    await buildRedeemTx(USER_ADDRESS, 5);
    expect(mockSubmitAndWait).not.toHaveBeenCalled();
  });

  it("propagates assembleTx errors (simulation failure)", async () => {
    mockAssembleTx.mockImplementationOnce(() => { throw new Error("Simulation failed: auth"); });
    await expect(buildRedeemTx(USER_ADDRESS, 1)).rejects.toThrow("Simulation failed");
  });
});

// ── addReward ────────────────────────────────────────────────────────────────

describe("addReward", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const builder  = makeTxBuilder();
    const assembled = makeAssembled();
    mockBuildBaseTx.mockResolvedValue(builder);
    mockSimulateTx.mockResolvedValue({ result: { retval: {} } });
    mockAssembleTx.mockReturnValue(assembled);
    mockSubmitAndWait.mockResolvedValue({
      txHash: "add-reward-hash", status: "SUCCESS", ledger: 10,
    });
  });

  it("returns txHash from submitAndWait", async () => {
    const result = await addReward(ADMIN_SECRET, 1, "Tree Badge", "desc", BigInt(100), null, "org-id-0001-0002-0003");
    expect(result.txHash).toBe("add-reward-hash");
  });

  it("returns explorerUrl derived from txHash", async () => {
    const result = await addReward(ADMIN_SECRET, 1, "Badge", "desc", BigInt(50), 10, "org-id-0001-0002-0003");
    expect(result.explorerUrl).toBe(
      "https://stellar.expert/explorer/testnet/tx/add-reward-hash"
    );
  });

  it("signs the assembled transaction with the admin keypair", async () => {
    await addReward(ADMIN_SECRET, 1, "Badge", "desc", BigInt(50), null, "org-id-0001-0002-0003");
    // The assembled tx's sign() method should have been called
    const assembled = mockAssembleTx.mock.results[0].value;
    expect(assembled.sign).toHaveBeenCalledTimes(1);
  });

  it("propagates errors from submitAndWait", async () => {
    mockSubmitAndWait.mockRejectedValueOnce(new Error("Network timeout"));
    await expect(
      addReward(ADMIN_SECRET, 1, "Badge", "desc", BigInt(50), null, "org-id-0001-0002-0003")
    ).rejects.toThrow("Network timeout");
  });
});

// ── getTotalBurned ────────────────────────────────────────────────────────────

describe("getTotalBurned", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const builder = makeTxBuilder();
    mockBuildBaseTx.mockResolvedValue(builder);
  });

  it("returns BigInt(0) when sim has no result", async () => {
    const mockServer = { simulateTransaction: jest.fn().mockResolvedValue({}) };
    mockGetServer.mockReturnValue(mockServer);
    const total = await getTotalBurned();
    expect(total).toBe(BigInt(0));
  });

  it("returns BigInt(0) when sim result is null", async () => {
    const mockServer = { simulateTransaction: jest.fn().mockResolvedValue({ result: null }) };
    mockGetServer.mockReturnValue(mockServer);
    const total = await getTotalBurned();
    expect(total).toBe(BigInt(0));
  });

  it("returns the parsed value when sim result is present", async () => {
    const { scValToNative } = await import("@stellar/stellar-sdk");
    (scValToNative as jest.Mock).mockReturnValueOnce(BigInt(500));

    const mockServer = {
      simulateTransaction: jest.fn().mockResolvedValue({
        result: { retval: { type: "i128" } },
      }),
    };
    mockGetServer.mockReturnValue(mockServer);

    const total = await getTotalBurned();
    expect(total).toBe(BigInt(500));
  });
});
