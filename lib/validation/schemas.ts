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

export const submitActionSchema = z.object({
  actionType:     z.enum(actionTypes),
  description:    z.string().min(5).max(200),
  evidenceHash:   z.string().regex(/^[0-9a-f]{64}$/, "Evidence hash must be a 64-char hex string (SHA-256)"),
  // orgId is NOT sent by the client — it is always extracted from the JWT
  // (Rule R-SAAS-01: never trust client-sent org_id)

  // EXIF anti-fraud fields — optional, extracted client-side from photo metadata
  exifLat:        z.number().min(-90).max(90).nullable().optional(),
  exifLng:        z.number().min(-180).max(180).nullable().optional(),
  exifCapturedAt: z.string().datetime({ offset: true }).nullable().optional(),
  exifDevice:     z.string().max(100).nullable().optional(),
  exifPresent:    z.boolean().optional(),
  proofHash:      z.string().regex(/^[0-9a-f]{64}$/).nullable().optional(),
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
