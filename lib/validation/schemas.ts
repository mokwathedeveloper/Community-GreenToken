import { z } from "zod";

// Rule R-API-03: MUST validate all request inputs with Zod before processing
// Rule R-API-STL-04: MUST validate Stellar public key format

// ── Stellar ────────────────────────────────────────────────────────────────
const stellarPublicKey = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar public key (must start with G, 56 chars)");

// ── Organizations ──────────────────────────────────────────────────────────
export const createOrgSchema = z.object({
  name:        z.string().min(2).max(100),
  slug:        z.string().regex(/^[a-z0-9-]{3,30}$/, "Slug must be 3-30 lowercase letters, numbers, or hyphens"),
  type:        z.enum(["school", "municipality", "ngo", "corporate", "other"]).optional(),
  tokenName:   z.string().min(2).max(30).optional(),
  tokenSymbol: z.string().regex(/^[A-Z]{3,5}$/, "Token symbol must be 3-5 uppercase letters").optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateOrgSchema = z.object({
  name:             z.string().min(2).max(100).optional(),
  tokenName:        z.string().min(2).max(30).optional(),
  tokenSymbol:      z.string().regex(/^[A-Z]{3,5}$/).optional(),
  primaryColor:     z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoUrl:          z.string().url().optional(),
  email:            z.string().email().optional(),
  contractAddress:  z.string().optional(),
  contractNetwork:  z.string().optional(),
});

// ── Invites ────────────────────────────────────────────────────────────────
export const createInviteSchema = z.object({
  role:     z.enum(["admin", "member"]).default("member"),
  usesLeft: z.number().int().positive().optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

// ── Actions ────────────────────────────────────────────────────────────────
export const actionTypes = [
  "Recycling", "TreePlanting", "Carpooling", "EnergySaving",
  "WaterSaving", "CommunityCleanup", "CompostingOrganics",
  "PublicTransport", "SolarEnergyUse", "BeachCleanup",
] as const;

// Canonical GTK token awards per action type (used by auto-verification).
// Impact-weighted: tree planting / beach cleanup = highest CO₂ offset per action.
export const ACTION_TOKEN_AMOUNTS: Record<string, number> = {
  Recycling:          10,
  TreePlanting:       25,
  Carpooling:         15,
  EnergySaving:       12,
  WaterSaving:        10,
  CommunityCleanup:   20,
  CompostingOrganics: 10,
  PublicTransport:     8,
  SolarEnergyUse:     20,
  BeachCleanup:       25,
};

// submitActionSchema validates only the text fields sent as FormData strings.
// The image file is validated directly in the route handler.
// EXIF (GPS, timestamp, device) is extracted server-side from the raw image bytes
// so it can never be spoofed from the request body.
export const submitActionSchema = z.object({
  actionType:  z.enum(actionTypes),
  description: z.string().min(5).max(200),
  // orgId is NOT sent by the client — extracted from JWT (Rule R-SAAS-01)
});

export const verifyActionSchema = z.object({
  actionId:    z.string().uuid(),
  tokensToMint: z.number().int().positive().max(1000),
});

export const rejectActionSchema = z.object({
  actionId: z.string().uuid(),
  reason:   z.string().min(5).max(200),
});

// ── Token Redemption ──────────────────────────────────────────────────────
export const redeemSchema = z.object({
  rewardId:  z.string().uuid(),
  signedXdr: z.string().min(10).optional(), // Freighter-signed XDR — optional until Phase 2 wallet signing
});

// ── Rewards ───────────────────────────────────────────────────────────────
export const createRewardSchema = z.object({
  title:       z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  tokenCost:   z.number().int().positive(),
  totalSupply: z.number().int().positive().optional(),
  imageUrl:    z.string().url().optional(),
});

// ── Donations ─────────────────────────────────────────────────────────────
export const createDonationSchema = z.object({
  projectName:   z.string().min(2).max(100),
  tokensDonated: z.number().int().positive(),
});

// ── Billing ───────────────────────────────────────────────────────────────
export const createCheckoutSchema = z.object({
  // Accept planId (preferred: "starter" | "pro") OR a direct priceId for backwards compatibility
  planId:  z.enum(["starter", "pro"]).optional(),
  priceId: z.string().startsWith("price_").optional(),
}).refine(d => d.planId || d.priceId, {
  message: "Either planId or priceId is required.",
});

// ── Wallet ────────────────────────────────────────────────────────────────
export const fundWalletSchema = z.object({
  publicKey: stellarPublicKey,
});

export const tokenBalanceSchema = z.object({
  address: stellarPublicKey,
});

// ── QR Events ─────────────────────────────────────────────────────────────
export const createQrEventSchema = z.object({
  actionType:  z.enum(actionTypes),
  label:       z.string().min(3).max(100),
  description: z.string().max(300).optional(),
  lat:         z.number().min(-90).max(90),           // mandatory — members must be on-site
  lng:         z.number().min(-180).max(180),          // mandatory — members must be on-site
  radiusM:     z.number().int().min(50).max(50000).default(200),
  tokensAward: z.number().int().min(1).max(10000).default(10),
  validFrom:   z.string().datetime(),
  validUntil:  z.string().datetime(),
}).refine(d => new Date(d.validUntil) > new Date(d.validFrom), {
  message: "validUntil must be after validFrom",
  path: ["validUntil"],
});

export const qrScanSchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// ── Members ───────────────────────────────────────────────────────────────
export const changeMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

// ── Helpers ───────────────────────────────────────────────────────────────
export type ActionType = typeof actionTypes[number];

/**
 * Parse and validate a request body using a Zod schema.
 * Returns { data } on success or { error } with a 400 response on failure.
 */
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: Response }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return {
        error: Response.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request body",
              details: result.error.flatten().fieldErrors,
            },
          },
          { status: 400 }
        ),
      };
    }
    return { data: result.data };
  } catch {
    return {
      error: Response.json(
        { error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } },
        { status: 400 }
      ),
    };
  }
}
