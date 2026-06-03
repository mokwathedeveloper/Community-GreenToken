import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { checkPlanAccess } from "@/lib/middleware/planGate";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/analytics/members
// Spec: saas/saas_api_endpoints.md — Analytics (Starter+ plan)
// Returns member growth, activity rates, and role distribution.

export async function GET(_req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const planGuard = await checkPlanAccess(auth, "analytics");
  if (planGuard) return planGuard;

  const supabase = createAdminClient();

  // Total members by role
  const { data: members } = await (supabase as any)
    .from("org_members")
    .select("role, joined_at")
    .eq("org_id", auth.orgId)
    .order("joined_at", { ascending: true }) as {
      data: { role: string; joined_at: string }[] | null;
    };

  const rows = members ?? [];
  const byRole: Record<string, number> = {};
  rows.forEach((m) => { byRole[m.role] = (byRole[m.role] ?? 0) + 1; });

  // Monthly growth (new members per month for last 6 months)
  const growth: Record<string, number> = {};
  rows.forEach((m) => {
    const month = m.joined_at.slice(0, 7); // YYYY-MM
    growth[month] = (growth[month] ?? 0) + 1;
  });

  // Active members — those with at least one action this month
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const { data: activeThisMonth } = await (supabase as any)
    .from("actions")
    .select("user_id")
    .eq("org_id", auth.orgId)
    .gte("submitted_at", monthStart.toISOString()) as { data: { user_id: string }[] | null };

  const activeUserIds = new Set((activeThisMonth ?? []).map((a) => a.user_id));

  return NextResponse.json({
    data: {
      total_members:   rows.length,
      by_role:         byRole,
      monthly_growth:  Object.entries(growth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, count]) => ({ month, count })),
      active_this_month: activeUserIds.size,
      activity_rate_pct: rows.length > 0
        ? Math.round((activeUserIds.size / rows.length) * 100)
        : 0,
    },
    meta: { org_id: auth.orgId },
  });
}
