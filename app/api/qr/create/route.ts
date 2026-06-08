/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, createQrEventSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/middleware/rateLimiter";

// POST /api/qr/create
// Admin creates a QR event — members scan to earn tokens automatically.
// The QR code encodes the URL /qr/{token}; the token is a 48-char hex secret.

export async function GET(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const url    = new URL(req.url);
  const limit  = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  const supabase = createAdminClient();

  const { data, error, count } = await (supabase as any)
    .from("qr_events")
    .select("id, action_type, label, description, lat, lng, radius_m, tokens_award, valid_from, valid_until, token, is_active, scan_count, created_at", { count: "exact" })
    .eq("org_id", auth!.orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch QR events." } },
      { status: 500 }
    );
  }

  // Compute status server-side so the client never needs Date.now() in render
  const serverNow = Date.now();
  type RawEvent = { is_active: boolean; valid_from: string; valid_until: string };
  const eventsWithStatus = (data ?? []).map((e: RawEvent) => {
    let status: "active" | "upcoming" | "expired" | "inactive";
    if (!e.is_active)                                                      status = "inactive";
    else if (serverNow < new Date(e.valid_from).getTime())                 status = "upcoming";
    else if (serverNow > new Date(e.valid_until).getTime())                status = "expired";
    else                                                                    status = "active";
    return { ...e, status };
  });

  return NextResponse.json({ data: eventsWithStatus, meta: { org_id: auth!.orgId, total: count ?? 0, limit, offset } });
}

export async function POST(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const ip    = req.headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const rlKey = rateLimitKey("qr_create", auth!.orgId, ip);
  const rl    = checkRateLimit(rlKey, "action_submit");
  if (rl) return rl;

  const parsed = await parseBody(req, createQrEventSchema);
  if ("error" in parsed) return parsed.error;

  const { actionType, label, description, lat, lng, radiusM, tokensAward, validFrom, validUntil } = parsed.data;

  const supabase = createAdminClient();

  const { data: event, error } = await (supabase as any)
    .from("qr_events")
    .insert({
      org_id:       auth!.orgId,
      created_by:   auth!.userId,
      action_type:  actionType,
      label,
      description:  description ?? null,
      lat:          lat ?? null,
      lng:          lng ?? null,
      radius_m:     radiusM,
      tokens_award: tokensAward,
      valid_from:   validFrom,
      valid_until:  validUntil,
    })
    .select("id, token, label, action_type, tokens_award, valid_from, valid_until, is_active, scan_count, created_at")
    .single();

  if (error || !event) {
    console.error("[api/qr/create] DB insert failed:", error);
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to create QR event." } },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000"}`;
  const scanUrl = `${appUrl}/qr/${event.token}`;

  return NextResponse.json(
    { data: { ...event, scanUrl }, meta: { org_id: auth!.orgId } },
    { status: 201 }
  );
}
