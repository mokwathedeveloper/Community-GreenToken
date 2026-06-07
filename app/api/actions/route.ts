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
    .select("id, action_type, description, status, tokens_awarded, submitted_at, stellar_tx_hash, user_id", { count: "exact" })
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

  return NextResponse.json({
    data:       data ?? [],
    pagination: { page, per_page: limit, total: count ?? 0 },
    meta:       { org_id: auth.orgId },
  });
}
