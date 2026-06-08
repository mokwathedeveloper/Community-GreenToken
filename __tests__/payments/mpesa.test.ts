/** @jest-environment node */
// Tests for lib/payments/mpesa.ts — fetch is fully mocked; no real HTTP calls.

const originalEnv = process.env;

beforeEach(() => {
  // Restore a clean env snapshot before every test
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

// ── formatPhone ───────────────────────────────────────────────────────────────

describe("formatPhone", () => {
  let formatPhone: (raw: string) => string;

  beforeAll(async () => {
    ({ formatPhone } = await import("@/lib/payments/mpesa"));
  });

  it("normalises 07xx number to 2547xx", () => {
    expect(formatPhone("0712345678")).toBe("254712345678");
  });

  it("leaves already-normalised 254 number unchanged", () => {
    expect(formatPhone("254712345678")).toBe("254712345678");
  });

  it("strips leading + before normalising", () => {
    expect(formatPhone("+254712345678")).toBe("254712345678");
  });

  it("prepends 254 to a bare 9-digit number", () => {
    expect(formatPhone("712345678")).toBe("254712345678");
  });

  it("strips spaces and dashes before normalising", () => {
    expect(formatPhone("0712 345 678")).toBe("254712345678");
    expect(formatPhone("0712-345-678")).toBe("254712345678");
  });
});

// ── isMpesaConfigured ─────────────────────────────────────────────────────────

describe("isMpesaConfigured", () => {
  const REQUIRED = {
    MPESA_CONSUMER_KEY:       "key",
    MPESA_CONSUMER_SECRET:    "secret",
    MPESA_SHORTCODE:          "60001",
    MPESA_INITIATOR_NAME:     "apiuser",
    MPESA_INITIATOR_PASSWORD: "cred",
  };

  async function freshImport() {
    jest.resetModules();
    const mod = await import("@/lib/payments/mpesa");
    return mod.isMpesaConfigured;
  }

  it("returns true when all required env vars are present", async () => {
    process.env = { ...process.env, ...REQUIRED };
    const isMpesaConfigured = await freshImport();
    expect(isMpesaConfigured()).toBe(true);
  });

  it.each(Object.keys(REQUIRED))("returns false when %s is missing", async (missing) => {
    const env = { ...REQUIRED } as Record<string, string>;
    delete env[missing];
    process.env = { ...process.env, ...env };
    const isMpesaConfigured = await freshImport();
    expect(isMpesaConfigured()).toBe(false);
  });
});

// ── b2cPayment ────────────────────────────────────────────────────────────────

describe("b2cPayment", () => {
  const ENV = {
    MPESA_CONSUMER_KEY:       "test-key",
    MPESA_CONSUMER_SECRET:    "test-secret",
    MPESA_SHORTCODE:          "60001",
    MPESA_INITIATOR_NAME:     "apiuser",
    MPESA_INITIATOR_PASSWORD: "encrypted-cred",
    MPESA_ENVIRONMENT:        "sandbox",
    NEXT_PUBLIC_APP_URL:      "https://test.example.com",
  };

  const TOKEN_RESPONSE = {
    ok: true,
    text: jest.fn().mockResolvedValue(""),
    json: jest.fn().mockResolvedValue({ access_token: "test-token-abc" }),
  };

  const B2C_SUCCESS = {
    ok: true,
    text: jest.fn().mockResolvedValue(""),
    json: jest.fn().mockResolvedValue({
      ResponseCode:             "0",
      ResponseDescription:      "Accept the service request successfully.",
      ConversationID:           "AG_20250101_CONV123",
      OriginatorConversationID: "gtk-test-withdrawal-12345",
    }),
  };

  const DEFAULT_PARAMS = {
    amountKes:    500,
    phoneNumber:  "0712345678",
    withdrawalId: "test-withdrawal-id-123",
    remarks:      "GreenToken withdrawal",
  };

  function mockFetch(responses: object[]) {
    let call = 0;
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(responses[call++] ?? responses[responses.length - 1]));
  }

  async function freshB2c() {
    jest.resetModules();
    process.env = { ...process.env, ...ENV };
    const { b2cPayment } = await import("@/lib/payments/mpesa");
    return b2cPayment;
  }

  it("returns conversationId and originatorId on success", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    const result = await b2cPayment(DEFAULT_PARAMS);
    expect(result.conversationId).toBe("AG_20250101_CONV123");
    expect(result.originatorId).toBe("gtk-test-withdrawal-12345");
  });

  it("obtains an access token via Basic auth before calling B2C", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment(DEFAULT_PARAMS);

    const fetchMock = global.fetch as jest.Mock;
    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(tokenUrl).toContain("oauth/v1/generate");
    expect(tokenInit.headers).toMatchObject({
      Authorization: expect.stringMatching(/^Basic /),
    });
  });

  it("sends phone number in normalised 254xx format in B2C payload", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment({ ...DEFAULT_PARAMS, phoneNumber: "0700111222" });

    const fetchMock = global.fetch as jest.Mock;
    const [, b2cInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(b2cInit.body as string);
    expect(body.PartyB).toBe("254700111222");
  });

  it("includes Bearer token in B2C Authorization header", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment(DEFAULT_PARAMS);

    const fetchMock = global.fetch as jest.Mock;
    const [, b2cInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect((b2cInit.headers as Record<string, string>)["Authorization"]).toBe("Bearer test-token-abc");
  });

  it("uses MPESA_B2C_COMMAND_ID env var when set", async () => {
    process.env = { ...process.env, ...ENV, MPESA_B2C_COMMAND_ID: "PromotionPayment" };
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);

    jest.resetModules();
    const { b2cPayment } = await import("@/lib/payments/mpesa");
    await b2cPayment(DEFAULT_PARAMS);

    const fetchMock = global.fetch as jest.Mock;
    const [, b2cInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(b2cInit.body as string);
    expect(body.CommandID).toBe("PromotionPayment");
  });

  it("defaults CommandID to BusinessPayment when env var is absent", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment(DEFAULT_PARAMS);

    const fetchMock = global.fetch as jest.Mock;
    const [, b2cInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(b2cInit.body as string);
    expect(body.CommandID).toBe("BusinessPayment");
  });

  it("truncates Remarks to 100 characters", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment({ ...DEFAULT_PARAMS, remarks: "x".repeat(200) });

    const fetchMock = global.fetch as jest.Mock;
    const [, b2cInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(b2cInit.body as string);
    expect(body.Remarks.length).toBe(100);
  });

  it("throws when access token request fails with non-ok HTTP status", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve("Unauthorized") });
    const b2cPayment = await freshB2c();
    await expect(b2cPayment(DEFAULT_PARAMS)).rejects.toThrow("M-Pesa OAuth failed");
  });

  it("throws when B2C API returns non-ok HTTP status", async () => {
    mockFetch([
      TOKEN_RESPONSE,
      { ok: false, status: 500, text: () => Promise.resolve("Internal Server Error"), json: jest.fn() },
    ]);
    const b2cPayment = await freshB2c();
    await expect(b2cPayment(DEFAULT_PARAMS)).rejects.toThrow("M-Pesa B2C request failed");
  });

  it("throws when B2C ResponseCode is not '0'", async () => {
    mockFetch([
      TOKEN_RESPONSE,
      {
        ok: true,
        text: jest.fn().mockResolvedValue(""),
        json: jest.fn().mockResolvedValue({
          ResponseCode:             "1",
          ResponseDescription:      "The initiator information is invalid.",
          ConversationID:           "",
          OriginatorConversationID: "",
        }),
      },
    ]);
    const b2cPayment = await freshB2c();
    await expect(b2cPayment(DEFAULT_PARAMS)).rejects.toThrow("M-Pesa B2C rejected");
  });

  it("calls the sandbox B2C endpoint when MPESA_ENVIRONMENT is sandbox", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment(DEFAULT_PARAMS);

    const fetchMock = global.fetch as jest.Mock;
    const [b2cUrl] = fetchMock.mock.calls[1] as [string];
    expect(b2cUrl).toContain("sandbox.safaricom.co.ke");
  });

  it("calls the production B2C endpoint when MPESA_ENVIRONMENT is production", async () => {
    process.env = { ...process.env, ...ENV, MPESA_ENVIRONMENT: "production" };
    jest.resetModules();
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const { b2cPayment } = await import("@/lib/payments/mpesa");
    await b2cPayment(DEFAULT_PARAMS);

    const fetchMock = global.fetch as jest.Mock;
    const [b2cUrl] = fetchMock.mock.calls[1] as [string];
    expect(b2cUrl).toContain("api.safaricom.co.ke");
  });

  it("rounds amountKes to the nearest integer in the payload", async () => {
    mockFetch([TOKEN_RESPONSE, B2C_SUCCESS]);
    const b2cPayment = await freshB2c();
    await b2cPayment({ ...DEFAULT_PARAMS, amountKes: 123.7 });

    const fetchMock = global.fetch as jest.Mock;
    const [, b2cInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(b2cInit.body as string);
    expect(body.Amount).toBe(124);
  });
});
