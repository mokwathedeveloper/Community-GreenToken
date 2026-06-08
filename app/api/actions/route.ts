/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/actions?status=pending&limit=20&page=1
// Rule R-API-01: org_id scoped — never returns cross-org data

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;

  const parsedLimit = parseInt(searchParams.get("limit") ?? "20", 10);
  const parsedPage  = parseInt(searchParams.get("page")  ?? "1",  10);
  const limit  = Math.min(50, Number.isNaN(parsedLimit) ? 20 : parsedLimit);
  const page   = Math.max(1,  Number.isNaN(parsedPage)  ? 1  : parsedPage);
  const offset = (page - 1) * limit;

  // Guard: user has no org yet (just signed up, hasn't completed /org/setup)
  if (!auth.orgId) {
    return NextResponse.json({
      data:       [],
      pagination: { page, per_page: limit, total: 0 },
      meta:       { org_id: "", hint: "Complete org setup to see actions." },
    });
  }

  const supabase = createAdminClient();
  // Use action_type (added in migration 020) and submitted_at — not the legacy type/created_at columns
  let query = (supabase as any)
    .from("actions")
    .select(
      "id, action_type, description, status, tokens_awarded, submitted_at, stellar_tx_hash, user_id, " +
      "exif_present, exif_lat, exif_lng, exif_captured_at, exif_device, is_cross_org_dup, qr_event_id",
      { count: "exact" }
    )
    .eq("org_id", auth.orgId)
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Members only see their own submissions; admins/owners see all org actions.
  // Admin queue is served by /api/actions/pending — this route is primarily member-facing.
  if (auth.role === "member") {
    query = query.eq("user_id", auth.userId);
  }

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query as {
    data: Record<string, unknown>[] | null;
    count: number | null;
    error: unknown;
  };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch actions." } },
      { status: 500 }
    );
  }

  const list = data ?? [];

  // For admins/owners, enrich each row with the submitting member's display name and email.
  // Two-step pattern: no implicit FK join (avoids PGRST204 schema-cache errors).
  let enriched: Record<string, unknown>[] = list;
  if (auth.role !== "member" && list.length > 0) {
    const userIds = [...new Set(list.map((r: any) => r.user_id as string))];
    const { data: users } = await (supabase as any)
      .from("users")
      .select("id, display_name, email")
      .in("id", userIds) as {
        data: { id: string; display_name: string | null; email: string | null }[] | null;
      };
    const userMap: Record<string, { display_name: string | null; email: string | null }> = {};
    for (const u of users ?? []) userMap[u.id] = { display_name: u.display_name, email: u.email };
    enriched = list.map((row: any) => ({ ...row, users: userMap[row.user_id as string] ?? null }));
  }

  return NextResponse.json({
    data:       enriched,
    pagination: { page, per_page: limit, total: count ?? 0 },
    meta:       { org_id: auth.orgId },
  });
}
