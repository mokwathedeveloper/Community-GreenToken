/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireSuperAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/metrics
 * Super admin: platform-wide MRR, org counts, member counts, uptime.
 * Used by the super admin dashboard revenue chart and stat cards.
 */
export async function GET() {
  const auth  = await getAuthContext();
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const supabase = createAdminClient();

  // Org counts by plan
  const { data: planCounts } = await (supabase as any)
    .from("organizations")
    .select("plan")
    .eq("is_active", true) as { data: { plan: string }[] | null };

  const plans = planCounts ?? [];
  const byPlan = plans.reduce<Record<string, number>>((acc, o) => {
    acc[o.plan] = (acc[o.plan] ?? 0) + 1;
    return acc;
  }, {});

  // MRR calculation (based on plan)
  const MRR_MAP: Record<string, number> = {
    starter: 49, pro: 199, enterprise: 599, free: 0,
  };
  const mrr = plans.reduce((sum, o) => sum + (MRR_MAP[o.plan] ?? 0), 0);

  // Total members across all orgs
  const { count: totalMembers } = await (supabase as any)
    .from("org_members")
    .select("id", { count: "exact", head: true }) as { count: number | null };

  // Total actions this month
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const { count: actionsThisMonth } = await (supabase as any)
    .from("actions")
    .select("id", { count: "exact", head: true })
    .gte("submitted_at", monthStart.toISOString()) as { count: number | null };

  // New orgs this month
  const { count: newOrgsThisMonth } = await (supabase as any)
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString()) as { count: number | null };

  // Total orgs
  const { count: totalOrgs } = await (supabase as any)
    .from("organizations")
    .select("id", { count: "exact", head: true }) as { count: number | null };

  return NextResponse.json({
    data: {
      mrr,
      total_orgs:          totalOrgs ?? 0,
      new_orgs_this_month: newOrgsThisMonth ?? 0,
      total_members:       totalMembers ?? 0,
      actions_this_month:  actionsThisMonth ?? 0,
      orgs_by_plan:        byPlan,
      platform_uptime_pct: 99.98,           // real monitoring would come from PagerDuty/Datadog
      timestamp:           new Date().toISOString(),
    },
  });
}
