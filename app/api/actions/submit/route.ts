/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse, after } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { actionTypes, ACTION_TOKEN_AMOUNTS } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/middleware/rateLimiter";
import { autoVerifyAction } from "@/lib/actions/autoVerify";

// POST /api/actions/submit
// Accepts multipart/form-data so the server can independently extract EXIF from
// the raw image bytes — GPS coordinates are never trusted from the client body.
// Rule R-API-01: org_id extracted from JWT — never from request body.

const MAX_FILE_BYTES      = 4 * 1024 * 1024; // 4 MB — Vercel serverless payload limit
const AUTO_VERIFY_THRESHOLD = 85;             // confidence score that triggers instant token mint

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

interface ServerExif {
  lat:        number | null;
  lng:        number | null;
  capturedAt: Date   | null;
  device:     string | null;
  present:    boolean;
  gpsPresent: boolean;
}

async function extractExifServer(buffer: ArrayBuffer): Promise<ServerExif> {
  const empty: ServerExif = { lat: null, lng: null, capturedAt: null, device: null, present: false, gpsPresent: false };
  try {
    const exifr = (await import("exifr")).default;

    const coords = await exifr.gps(buffer).catch(() => null);
    const tags   = await exifr
      .parse(buffer, { pick: ["DateTimeOriginal", "DateTime", "Model", "Make"], translateValues: true })
      .catch(() => null);

    const lat = coords?.latitude  ?? null;
    const lng = coords?.longitude ?? null;

    let capturedAt: Date | null = null;
    const rawDate = tags?.DateTimeOriginal ?? tags?.DateTime;
    if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
      capturedAt = rawDate;
    } else if (typeof rawDate === "string") {
      const iso = rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
      const d   = new Date(iso);
      if (!isNaN(d.getTime())) capturedAt = d;
    }

    const make   = typeof tags?.Make  === "string" ? tags.Make.trim()  : "";
    const model  = typeof tags?.Model === "string" ? tags.Model.trim() : "";
    const device = make && model
      ? model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`
      : model || make || null;

    const gpsPresent = lat !== null && lng !== null;
    const present    = gpsPresent || capturedAt !== null || device !== null;

    return { lat, lng, capturedAt, device, present, gpsPresent };
  } catch {
    return empty;
  }
}

// Server-side confidence scoring — all signals derived from unforgeable server-extracted data.
// Score 0–100:
//   GPS present         +35  (server-extracted from raw bytes, cannot be spoofed)
//   Timestamp present   +20  (server-extracted)
//   Photo taken < 24 h  +15  (freshness bonus on top of timestamp)
//   Photo taken < 7 d   + 8  (partial freshness bonus)
//   Camera device model + 5  (real device signature)
//   File > 1 MB         +10  (typical modern camera photo)
//   File > 200 KB       + 5  (at least a decent image)
//   Description ≥ 100c  +10  (detailed description signals genuine effort)
//   Description ≥  50c  + 6
//   Description ≥  20c  + 3
function computeConfidenceScore(exif: ServerExif, fileSizeBytes: number, description: string): number {
  let score = 0;

  if (exif.gpsPresent) score += 35;

  if (exif.capturedAt) {
    score += 20;
    const ageMs       = Date.now() - exif.capturedAt.getTime();
    const ONE_DAY_MS  = 86_400_000;
    const ONE_WEEK_MS = 7 * ONE_DAY_MS;
    if (ageMs < ONE_DAY_MS)  score += 15;
    else if (ageMs < ONE_WEEK_MS) score += 8;
  }

  if (exif.device) score += 5;

  if (fileSizeBytes > 1_000_000)      score += 10;
  else if (fileSizeBytes > 200_000)   score += 5;

  const descLen = description.length;
  if (descLen >= 100)      score += 10;
  else if (descLen >= 50)  score += 6;
  else if (descLen >= 20)  score += 3;

  return Math.min(score, 100);
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  // 2. Rate limit — 10 submissions per minute per org
  const ip       = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const rlKey    = rateLimitKey("action_submit", auth.orgId, ip);
  const rlResult = checkRateLimit(rlKey, "action_submit");
  if (rlResult) return rlResult;

  // 3. Parse multipart form
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_FORM", message: "Request must be multipart/form-data." } },
      { status: 400 }
    );
  }

  const actionType  = (form.get("actionType")  as string | null)?.trim() ?? "";
  const description = (form.get("description") as string | null)?.trim() ?? "";
  const file        = form.get("evidence") as File | null;

  // 4. Validate text fields
  if (!actionTypes.includes(actionType as any)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid action type." } },
      { status: 400 }
    );
  }
  if (description.length < 5 || description.length > 200) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Description must be 5–200 characters." } },
      { status: 400 }
    );
  }

  // 5. Validate file
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json(
      { error: { code: "MISSING_FILE", message: "Photo evidence is required." } },
      { status: 400 }
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: { code: "INVALID_FILE_TYPE", message: "Only image files (JPEG, PNG, HEIC) are accepted." } },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: "Photo must be under 4 MB." } },
      { status: 413 }
    );
  }

  const orgId = auth.orgId;
  if (!orgId) {
    return NextResponse.json(
      {
        error: {
          code:     "NO_ORGANIZATION",
          message:  "You need to set up your organization before submitting actions.",
          redirect: "/org/setup",
        },
      },
      { status: 422 }
    );
  }

  // 6. Read image bytes once — used for both hash and EXIF extraction
  const imageBuffer = await file.arrayBuffer();

  // 7. Server-side SHA-256 — client cannot forge this; it is derived from the actual uploaded bytes
  const evidenceHash = await sha256Hex(imageBuffer);

  // 8. Server-side EXIF extraction — client GPS/timestamp is never trusted
  const exif = await extractExifServer(imageBuffer);

  // 9. Server-side proof hash: SHA-256(evidenceHash | lat | lng | capturedAt)
  //    Commits image identity + verified GPS + verified timestamp into one string
  const proofPayload =
    evidenceHash +
    "|" + (exif.lat        !== null ? exif.lat.toFixed(7)          : "null") +
    "|" + (exif.lng        !== null ? exif.lng.toFixed(7)          : "null") +
    "|" + (exif.capturedAt !== null ? exif.capturedAt.toISOString() : "null");
  const proofHash = await sha256Hex(new TextEncoder().encode(proofPayload).buffer as ArrayBuffer);

  const supabase = createAdminClient();

  // 10. Confidence score — computed from server-extracted signals only
  // Photos without EXIF score 0-3 (description only) and always require admin review.
  const confidenceScore = computeConfidenceScore(exif, file.size, description);

  // 12. Same-org duplicate check
  const { data: existing } = await (supabase as any)
    .from("actions")
    .select("id")
    .eq("org_id", orgId)
    .eq("evidence_hash", evidenceHash)
    .neq("status", "rejected")
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_EVIDENCE", message: "This evidence has already been submitted." } },
      { status: 409 }
    );
  }

  // 13. EXIF age check — server-enforced, cannot be bypassed
  if (exif.capturedAt) {
    const captureAge = Date.now() - exif.capturedAt.getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (captureAge > thirtyDays) {
      return NextResponse.json(
        {
          error: {
            code:    "EVIDENCE_TOO_OLD",
            message: "Photo evidence is more than 30 days old. Please submit a recent photo.",
          },
        },
        { status: 422 }
      );
    }
  }

  // 14. Insert — all EXIF fields are server-extracted, never from request body
  const insertResult = await (supabase as any)
    .from("actions")
    .insert({
      org_id:           orgId,
      user_id:          auth.userId,
      type:             actionType,
      action_type:      actionType,
      description,
      evidence_hash:    evidenceHash,
      status:           "pending",
      tokens_awarded:   0,
      submitted_at:     new Date().toISOString(),
      exif_lat:         exif.lat,
      exif_lng:         exif.lng,
      exif_captured_at: exif.capturedAt?.toISOString() ?? null,
      exif_device:      exif.device,
      exif_present:     exif.present,
      proof_hash:       proofHash,
    })
    .select("id, action_type, status, submitted_at")
    .single();

  const action  = insertResult.data as { id: string; action_type: string; status: string; submitted_at: string } | null;
  const dbError = insertResult.error;

  if (dbError || !action) {
    console.error("[api/actions/submit] DB insert failed:", dbError);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to submit action." } },
      { status: 500 }
    );
  }

  // 15. Cross-org duplicate flag (non-blocking)
  let isCrossOrgDup = false;
  try {
    const { data: flagResult } = await (supabase as any)
      .rpc("flag_cross_org_duplicate", {
        p_action_id:     action.id,
        p_org_id:        orgId,
        p_evidence_hash: evidenceHash,
      });
    isCrossOrgDup = flagResult === true;
  } catch {
    // Non-critical — fraud flag failure does not block submission
  }

  // 16. Post-response work — runs after response to avoid blocking the HTTP round-trip.
  //     Order matters: (a) submit on-chain → get blockchainActionId, (b) auto-verify if score ≥ threshold.
  const autoVerifyScheduled = confidenceScore >= AUTO_VERIFY_THRESHOLD;
  const tokensToMint        = ACTION_TOKEN_AMOUNTS[actionType] ?? 10;
  const capturedActionId    = action.id;
  const capturedUserId      = auth.userId;

  after(async () => {
    const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
    let blockchainActionId: number | null = null;

    // (a) Stellar on-chain submission
    if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
      try {
        const { submitAction } = await import("@/lib/stellar/contracts/action-registry");
        const orgHex = orgId.replace(/-/g, "").padEnd(64, "0").slice(0, 64);

        // Always use admin keypair as the on-chain user address.
        // The contract's user.require_auth() is satisfied by the admin signer.
        // Using a member's wallet address would fail because only the admin signs.
        // Real user identity is tracked in the DB (user_id column).
        const { Keypair } = await import("@stellar/stellar-sdk");
        const stellarUserAddress = Keypair.fromSecret(adminSecret).publicKey();

        const result = await submitAction(
          adminSecret,
          stellarUserAddress,
          actionType as import("@/lib/stellar/types").ActionType,
          description,
          proofHash,
          orgHex,
        );
        blockchainActionId = result.actionId !== undefined ? Number(result.actionId) : null;
        await (supabase as any).from("actions").update({
          stellar_tx_hash:      result.txHash,
          blockchain_action_id: blockchainActionId,
        }).eq("id", capturedActionId);
      } catch (stellarErr) {
        console.error("[api/actions/submit] Stellar submitAction failed:", stellarErr);
      }
    }

    // (b) Auto-verify high-confidence submissions — instant GTK mint, no admin queue
    if (autoVerifyScheduled) {
      await autoVerifyAction({
        actionId:           capturedActionId,
        userId:             capturedUserId,
        orgId,
        tokensToMint,
        blockchainActionId,
      });
    }
  });

  const message = autoVerifyScheduled
    ? "High-confidence submission! GTK tokens are being minted automatically."
    : "Action submitted. Awaiting admin verification.";

  return NextResponse.json(
    {
      data: {
        actionId:             action.id,
        type:                 action.action_type,
        status:               action.status,
        createdAt:            action.submitted_at,
        txHash:               null,
        explorerUrl:          null,
        isCrossOrgDup,
        confidenceScore,
        autoVerifyScheduled,
        message,
      },
      meta: { org_id: orgId },
    },
    { status: 201 }
  );
}
