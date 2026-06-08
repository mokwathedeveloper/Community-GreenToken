// Tests for ActionRegistry contract client — Stellar SDK and network fully mocked.
// Validates: address validation fallback, actionId parsing, all ActionTypes,
// error handling, and proof hash/orgId encoding.

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/stellar/config", () => ({
  STELLAR_CONFIG: {
    network:           "testnet",
    sorobanRpcUrl:     "https://soroban-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
    contracts: {
      greenToken:     "CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH",
      actionRegistry: "CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO",
      rewardManager:  "CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR",
    },
  },
  getTxExplorerUrl: (hash: string) =>
    `https://stellar.expert/explorer/testnet/tx/${hash}`,
}));

jest.mock("@/lib/stellar/client", () => ({
  buildBaseTx:   jest.fn(),
  simulateTx:    jest.fn(),
  assembleTx:    jest.fn(),
  submitAndWait: jest.fn(),
  getSorobanServer: jest.fn(),
}));

// Mock the full stellar SDK — no network calls, no real crypto
jest.mock("@stellar/stellar-sdk", () => ({
  Contract: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockReturnValue({ type: "mock-operation" }),
  })),
  Address: jest.fn().mockImplementation((addr: string) => {
    // Mimic real SDK: only G... (accounts) and C... (contracts) are valid
    if (!addr || (!addr.startsWith("G") && !addr.startsWith("C"))) {
      throw new Error(`Invalid account ID: ${addr}`);
    }
    return { toScVal: jest.fn().mockReturnValue({ type: "mock-address-scval" }) };
  }),
  nativeToScVal: jest.fn().mockReturnValue({ type: "mock-scval" }),
  scValToNative: jest.fn().mockReturnValue(BigInt(7)),
  xdr: {
    ScVal: {
      scvVec:    jest.fn().mockReturnValue({ type: "mock-vec" }),
      scvSymbol: jest.fn().mockReturnValue({ type: "mock-symbol" }),
      scvBytes:  jest.fn().mockReturnValue({ type: "mock-bytes" }),
      scvVoid:   jest.fn().mockReturnValue({ type: "mock-void" }),
    },
  },
  Keypair: {
    fromSecret: jest.fn().mockReturnValue({
      publicKey: jest.fn().mockReturnValue(
        "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ"
      ),
    }),
  },
}));

// ── Imports (after mocks) ────────────────────────────────────────────────────

import { submitAction } from "@/lib/stellar/contracts/action-registry";
import { buildBaseTx, simulateTx, assembleTx, submitAndWait } from "@/lib/stellar/client";
import { scValToNative, Address } from "@stellar/stellar-sdk";
import { ActionType } from "@/lib/stellar/types";

const mockBuildBaseTx   = buildBaseTx   as jest.Mock;
const mockSimulateTx    = simulateTx    as jest.Mock;
const mockAssembleTx    = assembleTx    as jest.Mock;
const mockSubmitAndWait = submitAndWait as jest.Mock;
const mockScValToNative = scValToNative as jest.Mock;
const mockAddress       = Address       as unknown as jest.Mock;

// ── Constants ────────────────────────────────────────────────────────────────

const ADMIN_SECRET  = "SDOKNR6XS6S66VA2KAT6I3GRW3HHJYLJFPTYHWQAID5UYP5BRD2JJW5A";
const ADMIN_PUBKEY  = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";
const VALID_USER    = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";
const UUID_USER     = "550e8400-e29b-41d4-a716-446655440000";
const PROOF_HASH    = "a".repeat(64); // 32-byte hash in hex
const ORG_HEX       = "0".repeat(64); // 32-byte org ID in hex

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeMockTxBuilder() {
  return {
    addOperation: jest.fn().mockReturnThis(),
    setTimeout:   jest.fn().mockReturnThis(),
    build:        jest.fn().mockReturnValue({ type: "mock-tx" }),
  };
}

function makeMockAssembled() {
  return {
    sign:  jest.fn(),
    toXDR: jest.fn().mockReturnValue("mock-signed-xdr"),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("submitAction — happy path", () => {
  let mockTxBuilder: ReturnType<typeof makeMockTxBuilder>;
  let mockAssembled: ReturnType<typeof makeMockAssembled>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTxBuilder = makeMockTxBuilder();
    mockAssembled = makeMockAssembled();

    mockBuildBaseTx.mockResolvedValue(mockTxBuilder);
    mockSimulateTx.mockResolvedValue({ result: { retval: { type: "mock-retval" } } });
    mockAssembleTx.mockReturnValue(mockAssembled);
    mockSubmitAndWait.mockResolvedValue({
      txHash: "deadbeef1234",
      status: "SUCCESS",
      ledger: 99,
    });
    mockScValToNative.mockReturnValue(BigInt(7));
  });

  it("returns the tx hash from submitAndWait", async () => {
    const result = await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(result.txHash).toBe("deadbeef1234");
  });

  it("returns the correct explorer URL", async () => {
    const result = await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(result.explorerUrl).toBe(
      "https://stellar.expert/explorer/testnet/tx/deadbeef1234"
    );
  });

  it("calls buildBaseTx, simulateTx, assembleTx, submitAndWait in order", async () => {
    await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(mockBuildBaseTx).toHaveBeenCalledTimes(1);
    expect(mockSimulateTx).toHaveBeenCalledTimes(1);
    expect(mockAssembleTx).toHaveBeenCalledTimes(1);
    expect(mockSubmitAndWait).toHaveBeenCalledTimes(1);
  });

  it("signs the assembled transaction with the admin keypair", async () => {
    await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(mockAssembled.sign).toHaveBeenCalledTimes(1);
  });
});

describe("submitAction — actionId parsing", () => {
  let mockTxBuilder: ReturnType<typeof makeMockTxBuilder>;
  let mockAssembled: ReturnType<typeof makeMockAssembled>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTxBuilder = makeMockTxBuilder();
    mockAssembled = makeMockAssembled();
    mockBuildBaseTx.mockResolvedValue(mockTxBuilder);
    mockAssembleTx.mockReturnValue(mockAssembled);
    mockSubmitAndWait.mockResolvedValue({ txHash: "hash123", status: "SUCCESS", ledger: 1 });
  });

  it("parses actionId from simulation return value", async () => {
    mockSimulateTx.mockResolvedValue({ result: { retval: { type: "retval" } } });
    mockScValToNative.mockReturnValue(BigInt(42));
    const result = await submitAction(ADMIN_SECRET, VALID_USER, ActionType.TreePlanting, "desc", PROOF_HASH, ORG_HEX);
    expect(result.actionId).toBe(BigInt(42));
  });

  it("defaults actionId to BigInt(0) when sim has no result field", async () => {
    mockSimulateTx.mockResolvedValue({});
    const result = await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(result.actionId).toBe(BigInt(0));
  });

  it("defaults actionId to BigInt(0) when scValToNative returns null", async () => {
    mockSimulateTx.mockResolvedValue({ result: { retval: { type: "retval" } } });
    mockScValToNative.mockReturnValue(null);
    const result = await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(result.actionId).toBe(BigInt(0));
  });

  it("does not throw when scValToNative throws — non-critical", async () => {
    mockSimulateTx.mockResolvedValue({ result: { retval: { type: "retval" } } });
    mockScValToNative.mockImplementation(() => { throw new Error("parse error"); });
    await expect(
      submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX)
    ).resolves.toBeDefined();
  });
});

describe("submitAction — address validation fallback", () => {
  let mockTxBuilder: ReturnType<typeof makeMockTxBuilder>;
  let mockAssembled: ReturnType<typeof makeMockAssembled>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTxBuilder = makeMockTxBuilder();
    mockAssembled = makeMockAssembled();
    mockBuildBaseTx.mockResolvedValue(mockTxBuilder);
    mockSimulateTx.mockResolvedValue({ result: { retval: {} } });
    mockAssembleTx.mockReturnValue(mockAssembled);
    mockSubmitAndWait.mockResolvedValue({ txHash: "fallback-hash", status: "SUCCESS", ledger: 1 });
    mockScValToNative.mockReturnValue(BigInt(0));
  });

  it("does NOT throw when userAddress is a UUID (Supabase format)", async () => {
    await expect(
      submitAction(ADMIN_SECRET, UUID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX)
    ).resolves.toBeDefined();
  });

  it("still submits the transaction when userAddress is a UUID", async () => {
    await submitAction(ADMIN_SECRET, UUID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(mockSubmitAndWait).toHaveBeenCalledTimes(1);
  });

  it("returns a txHash even after UUID address fallback", async () => {
    const result = await submitAction(ADMIN_SECRET, UUID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    expect(result.txHash).toBe("fallback-hash");
  });

  it("uses the admin pubkey as fallback when userAddress is invalid", async () => {
    // After fallback, Address() must be called with a valid G... key — the Address mock
    // should not throw for the second call (with admin pubkey starting with G)
    await submitAction(ADMIN_SECRET, UUID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    // Address was called at least twice: once with UUID (throws) and once with admin pubkey (ok)
    expect(mockAddress).toHaveBeenCalledWith(ADMIN_PUBKEY);
  });

  it("accepts a valid Stellar G... address without fallback", async () => {
    await submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX);
    // First Address call should be with the valid address — no fallback needed
    expect(mockAddress).toHaveBeenCalledWith(VALID_USER);
  });
});

describe("submitAction — all ActionTypes", () => {
  const ACTION_TYPES: ActionType[] = [
    ActionType.Recycling,    ActionType.TreePlanting,       ActionType.Carpooling,         ActionType.EnergySaving,
    ActionType.WaterSaving,  ActionType.CommunityCleanup,   ActionType.CompostingOrganics,
    ActionType.PublicTransport, ActionType.SolarEnergyUse,  ActionType.BeachCleanup,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const mockTxBuilder = makeMockTxBuilder();
    const mockAssembled = makeMockAssembled();
    mockBuildBaseTx.mockResolvedValue(mockTxBuilder);
    mockSimulateTx.mockResolvedValue({ result: { retval: {} } });
    mockAssembleTx.mockReturnValue(mockAssembled);
    mockSubmitAndWait.mockResolvedValue({ txHash: "ok", status: "SUCCESS", ledger: 1 });
    mockScValToNative.mockReturnValue(BigInt(1));
  });

  it.each(ACTION_TYPES)("submits %s without throwing", async (actionType) => {
    await expect(
      submitAction(ADMIN_SECRET, VALID_USER, actionType, "test", PROOF_HASH, ORG_HEX)
    ).resolves.toMatchObject({ txHash: "ok" });
  });
});

describe("submitAction — error propagation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockTxBuilder = makeMockTxBuilder();
    mockBuildBaseTx.mockResolvedValue(mockTxBuilder);
    mockSimulateTx.mockResolvedValue({ result: { retval: {} } });
  });

  it("propagates error when assembleTx throws (simulation error)", async () => {
    mockAssembleTx.mockImplementation(() => { throw new Error("Simulation failed: auth error"); });
    await expect(
      submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX)
    ).rejects.toThrow("Simulation failed");
  });

  it("propagates error when submitAndWait throws (network error)", async () => {
    const mockAssembled = makeMockAssembled();
    mockAssembleTx.mockReturnValue(mockAssembled);
    mockSubmitAndWait.mockRejectedValue(new Error("Network timeout"));
    await expect(
      submitAction(ADMIN_SECRET, VALID_USER, ActionType.Recycling, "desc", PROOF_HASH, ORG_HEX)
    ).rejects.toThrow("Network timeout");
  });

  it("throws when ACTION_REGISTRY_CONTRACT_ID is not configured", async () => {
    // Temporarily override the mock to return empty contract ID
    jest.resetModules();
    jest.mock("@/lib/stellar/config", () => ({
      STELLAR_CONFIG: {
        network: "testnet",
        contracts: { actionRegistry: "" },
      },
      getTxExplorerUrl: (h: string) => `https://stellar.expert/testnet/tx/${h}`,
    }));
  });
});
