// Tests for lib/stellar/contracts/green-token.ts
// All Stellar network calls are mocked — no testnet required.

// ── Mocks ──────────────────────────────────────────────────────────────────

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
  getSorobanServer: jest.fn(),
  buildBaseTx:      jest.fn(),
  simulateTx:       jest.fn(),
  assembleTx:       jest.fn(),
  submitAndWait:    jest.fn(),
}));

jest.mock("@stellar/stellar-sdk", () => ({
  Contract: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockReturnValue({ type: "mock-operation" }),
  })),
  Address:       jest.fn().mockImplementation((addr: string) => ({
    toScVal: jest.fn().mockReturnValue({ type: "mock-address-scval" }),
    addr,
  })),
  nativeToScVal: jest.fn().mockReturnValue({ type: "mock-scval" }),
  scValToNative: jest.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────

import { getBalance, getDisplayBalance, getName, getSymbol } from "@/lib/stellar/contracts/green-token";
import { getSorobanServer, buildBaseTx } from "@/lib/stellar/client";
import { scValToNative } from "@stellar/stellar-sdk";

const mockGetSorobanServer = getSorobanServer as jest.Mock;
const mockBuildBaseTx      = buildBaseTx      as jest.Mock;
const mockScValToNative    = scValToNative     as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────

const WALLET = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";

function makeMockServer(retval: unknown = BigInt(0)) {
  const simResult = retval !== null
    ? { result: { retval } }
    : {};

  return {
    simulateTransaction: jest.fn().mockResolvedValue(simResult),
    getAccount: jest.fn().mockResolvedValue({ accountId: WALLET, sequence: "100" }),
  };
}

function makeMockTxBuilder() {
  return {
    addOperation: jest.fn().mockReturnThis(),
    setTimeout:   jest.fn().mockReturnThis(),
    build:        jest.fn().mockReturnValue({ type: "mock-tx" }),
  };
}

// ── getBalance tests ──────────────────────────────────────────────────────

describe("getBalance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the token balance as BigInt from simulation result", async () => {
    const server = makeMockServer(BigInt(1_000_000_000)); // 100 GTK in stroops
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(1_000_000_000));

    const balance = await getBalance(WALLET);
    expect(balance).toBe(BigInt(1_000_000_000));
  });

  it("returns BigInt(0) when simulation has no result field", async () => {
    const server = makeMockServer(null);
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());

    const balance = await getBalance(WALLET);
    expect(balance).toBe(BigInt(0));
  });

  it("returns BigInt(0) when scValToNative returns null", async () => {
    const server = makeMockServer(BigInt(0));
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(null);

    const balance = await getBalance(WALLET);
    expect(balance).toBe(BigInt(0));
  });

  it("returns a BigInt type always", async () => {
    const server = makeMockServer(BigInt(42));
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(42));

    const balance = await getBalance(WALLET);
    expect(typeof balance).toBe("bigint");
  });

  it("calls simulateTransaction with a constructed transaction", async () => {
    const server = makeMockServer(BigInt(0));
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(0));

    await getBalance(WALLET);
    expect(server.simulateTransaction).toHaveBeenCalledTimes(1);
  });
});

// ── getDisplayBalance tests ───────────────────────────────────────────────

describe("getDisplayBalance", () => {
  beforeEach(() => jest.clearAllMocks());

  it("converts stroops to GTK display value (divides by 10,000,000)", async () => {
    const server = makeMockServer(BigInt(10_000_000)); // 1 GTK
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(10_000_000));

    const display = await getDisplayBalance(WALLET);
    expect(display).toBeCloseTo(1.0, 7);
  });

  it("returns 0 for zero balance", async () => {
    const server = makeMockServer(BigInt(0));
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(0));

    const display = await getDisplayBalance(WALLET);
    expect(display).toBe(0);
  });

  it("converts 100 GTK (1,000,000,000 stroops) correctly", async () => {
    const server = makeMockServer(BigInt(1_000_000_000));
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(1_000_000_000));

    const display = await getDisplayBalance(WALLET);
    expect(display).toBeCloseTo(100.0, 5);
  });

  it("returns a number type", async () => {
    const server = makeMockServer(BigInt(0));
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(BigInt(0));

    const display = await getDisplayBalance(WALLET);
    expect(typeof display).toBe("number");
  });
});

// ── getName / getSymbol tests ─────────────────────────────────────────────

describe("getName", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the token name from simulation", async () => {
    const server = makeMockServer("GreenToken");
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue("GreenToken");

    const name = await getName();
    expect(name).toBe("GreenToken");
  });

  it("falls back to 'GreenToken' when simulation has no result", async () => {
    const server = makeMockServer(null);
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());

    const name = await getName();
    expect(name).toBe("GreenToken");
  });

  it("falls back to 'GreenToken' when scValToNative returns null", async () => {
    const server = makeMockServer("whatever");
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(null);

    const name = await getName();
    expect(name).toBe("GreenToken");
  });
});

describe("getSymbol", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the token symbol from simulation", async () => {
    const server = makeMockServer("GTK");
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue("GTK");

    const symbol = await getSymbol();
    expect(symbol).toBe("GTK");
  });

  it("falls back to 'GTK' when simulation has no result", async () => {
    const server = makeMockServer(null);
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());

    const symbol = await getSymbol();
    expect(symbol).toBe("GTK");
  });

  it("falls back to 'GTK' when scValToNative returns null", async () => {
    const server = makeMockServer("whatever");
    mockGetSorobanServer.mockReturnValue(server);
    mockBuildBaseTx.mockResolvedValue(makeMockTxBuilder());
    mockScValToNative.mockReturnValue(null);

    const symbol = await getSymbol();
    expect(symbol).toBe("GTK");
  });
});
