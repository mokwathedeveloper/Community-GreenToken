import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { checkPlanAccess } from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/analytics/actions
// Spec: saas/saas_api_endpoints.md — Analytics (Starter+ plan)
// Returns action trends over time: daily counts grouped by action_type and status.
// Query: ?from=ISO&to=ISO&groupBy=day|week|month

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const planGuard = await checkPlanAccess(auth, "analytics");
  if (planGuard) return planGuard;

  const { searchParams } = req.nextUrl;
  const from    = searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const to      = searchParams.get("to")   ?? new Date().toISOString().split("T")[0];

  const supabase = createAdminClient();

  // Daily action counts by status
  const { data: actions } = await (supabase as any)
    .from("actions")
    .select("action_type, status, submitted_at")
    .eq("org_id", auth.orgId)
    .gte("submitted_at", `${from}T00:00:00Z`)
    .lte("submitted_at", `${to}T23:59:59Z`)
    .order("submitted_at", { ascending: true }) as {
      data: { action_type: string; status: string; submitted_at: string }[] | null;
    };

  // Group by date
  const byDate: Record<string, { date: string; submitted: number; verified: number; rejected: number; total: number }> = {};

  for (const a of actions ?? []) {
    const date = a.submitted_at.split("T")[0];
    if (!byDate[date]) byDate[date] = { date, submitted: 0, verified: 0, rejected: 0, total: 0 };
    byDate[date].total++;
    if (a.status === "pending")  byDate[date].submitted++;
    if (a.status === "verified") byDate[date].verified++;
    if (a.status === "rejected") byDate[date].rejected++;
  }

  // Type distribution
  const byType: Record<string, number> = {};
  for (const a of actions ?? []) {
    byType[a.action_type] = (byType[a.action_type] ?? 0) + 1;
  }

  return NextResponse.json({
    data: {
      trend:         Object.values(byDate),
      by_type:       Object.entries(byType).map(([type, count]) => ({ type, count })),
      total_actions: (actions ?? []).length,
      from, to,
    },
    meta: { org_id: auth.orgId },
  });
}
