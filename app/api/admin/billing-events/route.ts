import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireSuperAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/billing-events
 * Super admin: paginated platform-wide billing event log.
 * Query params: ?page=1&limit=20&orgId=uuid&event_type=subscription.updated
 */
export async function GET(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const { searchParams } = req.nextUrl;
  const page      = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit     = Math.min(100, Number(searchParams.get("limit") ?? 20));
  const orgId     = searchParams.get("orgId");
  const eventType = searchParams.get("event_type");
  const offset    = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = (supabase as any)
    .from("billing_events")
    .select(`
      id, org_id, event_type, stripe_event_id,
      amount_cents, currency, status, metadata, created_at,
      organizations(name, slug, plan)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (orgId)     query = query.eq("org_id", orgId);
  if (eventType) query = query.eq("event_type", eventType);

  const { data, count, error } = await query as {
    data: Record<string, unknown>[] | null;
    count: number | null;
    error: unknown;
  };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch billing events." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data ?? [],
    meta: { page, limit, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / limit) },
  });
}
