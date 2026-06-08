/**
 * @jest-environment node
 */
// Tests for Stellar network configuration and explorer URL helpers.
// Contract IDs depend on env vars so are tested structurally, not by value.
import {
  STELLAR_CONFIG,
  getExplorerBase,
  getTxExplorerUrl,
  getContractExplorerUrl,
} from "@/lib/stellar/config";

// Known Soroban contract ID for URL helper tests (does not require env vars)
const SAMPLE_CONTRACT_ID = "CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH";

describe("STELLAR_CONFIG — network defaults", () => {
  it("defaults to testnet network", () => {
    expect(STELLAR_CONFIG.network).toBe("testnet");
  });

  it("uses the Stellar testnet Horizon URL", () => {
    expect(STELLAR_CONFIG.horizonUrl).toBe("https://horizon-testnet.stellar.org");
  });

  it("uses the Stellar testnet Soroban RPC URL", () => {
    expect(STELLAR_CONFIG.sorobanRpcUrl).toBe("https://soroban-testnet.stellar.org");
  });

  it("uses the correct testnet network passphrase", () => {
    expect(STELLAR_CONFIG.networkPassphrase).toBe("Test SDF Network ; September 2015");
  });
});

describe("STELLAR_CONFIG — contracts structure", () => {
  it("has a contracts object with greenToken, actionRegistry, rewardManager keys", () => {
    expect(STELLAR_CONFIG.contracts).toHaveProperty("greenToken");
    expect(STELLAR_CONFIG.contracts).toHaveProperty("actionRegistry");
    expect(STELLAR_CONFIG.contracts).toHaveProperty("rewardManager");
  });

  it("all contract ID values are strings", () => {
    expect(typeof STELLAR_CONFIG.contracts.greenToken).toBe("string");
    expect(typeof STELLAR_CONFIG.contracts.actionRegistry).toBe("string");
    expect(typeof STELLAR_CONFIG.contracts.rewardManager).toBe("string");
  });

  it("configured contract IDs match the Soroban format (C + 55 base32 chars)", () => {
    // Only validate format when the env var is actually set
    const contractFormat = /^C[A-Z2-7]{55}$/;
    [
      STELLAR_CONFIG.contracts.greenToken,
      STELLAR_CONFIG.contracts.actionRegistry,
      STELLAR_CONFIG.contracts.rewardManager,
    ].forEach(id => {
      if (id) {
        expect(id).toMatch(contractFormat);
      }
    });
  });
});

describe("getExplorerBase", () => {
  it("returns the testnet explorer base URL", () => {
    expect(getExplorerBase()).toBe("https://stellar.expert/explorer/testnet");
  });

  it("returns a URL that starts with https://", () => {
    expect(getExplorerBase()).toMatch(/^https:\/\//);
  });

  it("contains 'testnet' in the path for the current network", () => {
    expect(getExplorerBase()).toContain("testnet");
  });
});

describe("getTxExplorerUrl", () => {
  it("constructs a full testnet transaction URL", () => {
    const hash = "deadbeef1234567890abcdef";
    const url  = getTxExplorerUrl(hash);
    expect(url).toBe(`https://stellar.expert/explorer/testnet/tx/${hash}`);
  });

  it("includes the tx hash verbatim in the URL", () => {
    const hash = "f94d857168a543d2f37838abc123";
    expect(getTxExplorerUrl(hash)).toContain(hash);
  });

  it("contains /tx/ path segment", () => {
    expect(getTxExplorerUrl("abc")).toContain("/tx/");
  });

  it("URL starts with the explorer base", () => {
    const base = getExplorerBase();
    const url  = getTxExplorerUrl("xyz");
    expect(url).toMatch(new RegExp(`^${base.replace(/\./g, "\\.")}`));
  });

  it("handles a 64-char hex hash (real Stellar tx hash format)", () => {
    const hash = "a".repeat(64);
    const url  = getTxExplorerUrl(hash);
    expect(url).toContain(hash);
    expect(url).toHaveLength("https://stellar.expert/explorer/testnet/tx/".length + 64);
  });
});

describe("getContractExplorerUrl", () => {
  it("constructs a full testnet contract URL", () => {
    const url = getContractExplorerUrl(SAMPLE_CONTRACT_ID);
    expect(url).toBe(`https://stellar.expert/explorer/testnet/contract/${SAMPLE_CONTRACT_ID}`);
  });

  it("contains /contract/ path segment", () => {
    expect(getContractExplorerUrl(SAMPLE_CONTRACT_ID)).toContain("/contract/");
  });

  it("includes the contract ID verbatim", () => {
    expect(getContractExplorerUrl(SAMPLE_CONTRACT_ID)).toContain(SAMPLE_CONTRACT_ID);
  });

  it("URL starts with explorer base", () => {
    const url = getContractExplorerUrl(SAMPLE_CONTRACT_ID);
    expect(url).toMatch(/^https:\/\/stellar\.expert\/explorer\/testnet\/contract\//);
  });

  it("builds different URLs for different contract IDs", () => {
    const id1 = "CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH";
    const id2 = "CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO";
    expect(getContractExplorerUrl(id1)).not.toBe(getContractExplorerUrl(id2));
  });
});
