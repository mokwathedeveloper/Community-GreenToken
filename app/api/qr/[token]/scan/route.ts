/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, qrScanSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/middleware/rateLimiter";

// POST /api/qr/[token]/scan
// Member submits their GPS location at a QR event.
// Action is auto-verified (no admin review needed).
// proofHash = SHA-256(qrToken | memberLat | memberLng | scanTime) → committed to Stellar.

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6_371_000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function sha256Hex(text: string): Promise<string> {
  const buf  = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

type QrEventRow = {
  id:           string;
  org_id:       string;
  created_by:   string;
  action_type:  string;
  label:        string;
  lat:          number;   // always set — GPS mandatory since migration 030
  lng:          number;   // always set — GPS mandatory since migration 030
  radius_m:     number;
  tokens_award: number;
  valid_from:   string;
  valid_until:  string;
  is_active:    boolean;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // 1. Auth — member must be logged in
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  // 2. Rate limit — 5 QR scans per minute per user
  const ip    = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const rlKey = rateLimitKey("qr_scan", auth.userId, ip);
  const rl    = checkRateLimit(rlKey, "action_submit");
  if (rl) return rl;

  // 3. Parse GPS from body — mandatory for all QR events
  const parsed = await parseBody(req, qrScanSchema);
  if ("error" in parsed) return parsed.error;
  const { lat: memberLat, lng: memberLng } = parsed.data;

  const supabase = createAdminClient();

  // 4. Fetch QR event by token
  const { data: event, error: fetchErr } = await (supabase as any)
    .from("qr_events")
    .select("id, org_id, created_by, action_type, label, lat, lng, radius_m, tokens_award, valid_from, valid_until, is_active")
    .eq("token", token)
    .single() as { data: QrEventRow | null; error: unknown };

  if (fetchErr || !event) {
    return NextResponse.json(
      { error: { code: "EVENT_NOT_FOUND", message: "QR event not found." } },
      { status: 404 }
    );
  }

  // 5. Validate event state
  if (!event.is_active) {
    return NextResponse.json(
      { error: { code: "EVENT_INACTIVE", message: "This QR event has been deactivated." } },
      { status: 410 }
    );
  }

  const now = Date.now();
  if (now < new Date(event.valid_from).getTime()) {
    return NextResponse.json(
      { error: { code: "EVENT_NOT_STARTED", message: "This QR event has not started yet." } },
      { status: 422 }
    );
  }
  if (now > new Date(event.valid_until).getTime()) {
    return NextResponse.json(
      { error: { code: "EVENT_EXPIRED", message: "This QR event has expired." } },
      { status: 410 }
    );
  }

  // 6. Org membership check — member must belong to the event's org
  if (auth.orgId !== event.org_id) {
    return NextResponse.json(
      { error: { code: "WRONG_ORG", message: "This QR event belongs to a different organization." } },
      { status: 403 }
    );
  }

  // 7. GPS validation — mandatory for all QR events (lat/lng are NOT NULL since migration 030)
  if (memberLat == null || memberLng == null) {
    return NextResponse.json(
      {
        error: {
          code:    "GPS_REQUIRED",
          message: "Your GPS location is required to verify you are at the event. Please enable location access and try again.",
        },
      },
      { status: 422 }
    );
  }

  const distanceM = haversineMetres(event.lat, event.lng, memberLat, memberLng);
  if (distanceM > event.radius_m) {
    return NextResponse.json(
      {
        error: {
          code:      "OUTSIDE_RADIUS",
          message:   `You are ${Math.round(distanceM)}m from the event location. You must be within ${event.radius_m}m to scan.`,
          distanceM: Math.round(distanceM),
          radiusM:   event.radius_m,
        },
      },
      { status: 422 }
    );
  }

  // 8. Duplicate scan check — one scan per user per event
  const { data: existing } = await (supabase as any)
    .from("actions")
    .select("id")
    .eq("qr_event_id", event.id)
    .eq("user_id", auth.userId)
    .neq("status", "rejected")
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: { code: "ALREADY_SCANNED", message: "You have already scanned this QR event." } },
      { status: 409 }
    );
  }

  // 9. Build proof hash — encodes the QR token + member GPS + timestamp
  //    This is the on-chain commitment: SHA-256(token|lat|lng|scanTime)
  const scanTime  = new Date();
  const latStr    = memberLat  != null ? memberLat.toFixed(7)  : "null";
  const lngStr    = memberLng  != null ? memberLng.toFixed(7)  : "null";
  const proofHash = await sha256Hex(`${token}|${latStr}|${lngStr}|${scanTime.toISOString()}`);

  // 10. Insert auto-verified action
  const { data: action, error: insertErr } = await (supabase as any)
    .from("actions")
    .insert({
      org_id:           event.org_id,
      user_id:          auth.userId,
      type:             event.action_type,
      action_type:      event.action_type,
      description:      `QR event: ${event.label}`,
      evidence_url:     null,
      status:           "verified",
      verified_by:      event.created_by,
      tokens_awarded:   event.tokens_award,
      submitted_at:     scanTime.toISOString(),
      exif_lat:         memberLat  ?? null,
      exif_lng:         memberLng  ?? null,
      exif_captured_at: null,
      exif_device:      null,
      exif_present:     false,
      proof_hash:       proofHash,
      qr_event_id:      event.id,
    })
    .select("id, action_type, status, tokens_awarded")
    .single() as { data: { id: string; action_type: string; status: string; tokens_awarded: number } | null; error: unknown };

  if (insertErr || !action) {
    console.error("[api/qr/scan] DB insert failed:", insertErr);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to record your scan. Please try again." } },
      { status: 500 }
    );
  }

  // 11. Atomic token balance increment
  const { error: rpcErr } = await (supabase as any)
    .rpc("increment_token_balance", {
      p_user_id: auth.userId,
      p_org_id:  event.org_id,
      p_amount:  event.tokens_award,
    });

  if (rpcErr) {
    // Roll back the action — keeps state consistent
    await (supabase as any)
      .from("actions")
      .update({ status: "rejected", tokens_awarded: 0 })
      .eq("id", action.id);
    console.error("[api/qr/scan] Token balance RPC failed:", rpcErr);
    return NextResponse.json(
      { error: { code: "BALANCE_UPDATE_FAILED", message: "Token balance could not be updated. Scan rolled back." } },
      { status: 500 }
    );
  }

  // 12. Atomic scan_count increment on qr_events
  await (supabase as any).rpc("increment_qr_scan_count", { p_qr_event_id: event.id });

  // 13. Stellar blockchain commitment — non-blocking (fires after response)
  const adminSecret = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (adminSecret && process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID) {
    after(async () => {
      try {
        const { submitAction } = await import("@/lib/stellar/contracts/action-registry");
        const orgHex = event.org_id.replace(/-/g, "").padEnd(64, "0").slice(0, 64);

        const result = await submitAction(
          adminSecret,
          auth.userId,
          event.action_type as import("@/lib/stellar/types").ActionType,
          `QR: ${event.label}`,
          proofHash,
          orgHex
        );

        await (supabase as any).from("actions").update({
          stellar_tx_hash:      result.txHash,
          blockchain_action_id: result.actionId ? Number(result.actionId) : null,
        }).eq("id", action.id);
      } catch (stellarErr) {
        console.error("[api/qr/scan] Stellar background call failed:", stellarErr);
      }
    });
  }

  return NextResponse.json(
    {
      data: {
        actionId:      action.id,
        tokensAwarded: action.tokens_awarded,
        proofHash,
        message:       `Verified! You earned ${action.tokens_awarded} GTK tokens.`,
      },
      meta: { org_id: event.org_id },
    },
    { status: 201 }
  );
}
