/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireSuperAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/orgs
 * Super admin: paginated list of all organizations across the platform.
 * Query params: ?page=1&limit=20&status=active&sort=mrr
 */
export async function GET(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const { searchParams } = req.nextUrl;
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(100, Number(searchParams.get("limit") ?? 20));
  const status = searchParams.get("status");
  const sort   = searchParams.get("sort") ?? "created_at";
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = (supabase as any)
    .from("organizations")
    .select(`
      id, name, slug, plan, subscription_status,
      trial_ends_at, member_limit, is_active,
      created_at, stripe_customer_id
    `, { count: "exact" });

  if (status) query = query.eq("subscription_status", status);

  const sortMap: Record<string, string> = {
    mrr:        "plan",
    created_at: "created_at",
    name:       "name",
    members:    "name",
  };
  query = query
    .order(sortMap[sort] ?? "created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: orgs, count, error } = await query as {
    data: Record<string, unknown>[] | null;
    count: number | null;
    error: unknown;
  };

  if (error) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch organizations." } },
      { status: 500 }
    );
  }

  // Fetch all member counts for this page in a single query (replaces N+1)
  const orgIds = (orgs ?? []).map((o) => o.id as string);
  const { data: memberRows } = orgIds.length
    ? await (supabase as any).from("org_members").select("org_id").in("org_id", orgIds)
    : { data: [] };

  const memberCountMap = new Map<string, number>();
  (memberRows ?? []).forEach((row: { org_id: string }) => {
    memberCountMap.set(row.org_id, (memberCountMap.get(row.org_id) ?? 0) + 1);
  });

  const enriched = (orgs ?? []).map((org) => ({
    ...org,
    member_count: memberCountMap.get(org.id as string) ?? 0,
  }));

  return NextResponse.json({
    data: enriched,
    meta: {
      page, limit,
      total:       count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  });
}

/**
 * PUT /api/admin/orgs — Super admin: bulk update (e.g. suspend)
 * Body: { orgId: string, action: "suspend" | "reactivate" | "set_plan", plan?: string }
 */
export async function PUT(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  let body: { orgId?: string; action?: string; plan?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }

  const { orgId, action, plan } = body;
  if (!orgId || !action) {
    return NextResponse.json({ error: { code: "MISSING_FIELDS", message: "orgId and action are required." } }, { status: 400 });
  }

  const supabase = createAdminClient();
  let update: Record<string, unknown> = {};

  if (action === "suspend")    update = { is_active: false, subscription_status: "canceled" };
  if (action === "reactivate") update = { is_active: true,  subscription_status: "active"   };
  if (action === "set_plan" && plan) update = { plan };

  const { error } = await (supabase as any)
    .from("organizations")
    .update(update)
    .eq("id", orgId);

  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: "Update failed." } }, { status: 500 });

  return NextResponse.json({ data: { orgId, action, applied: update } });
}
