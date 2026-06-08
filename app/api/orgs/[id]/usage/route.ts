/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized, forbidden } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/orgs/[id]/usage
// Spec: saas/saas_api_endpoints.md — Organization Management
// Returns current plan usage: member count, token supply, actions this month

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { id: orgId } = await params;

  // Must be member of this org or superadmin
  if (auth.orgId !== orgId && auth.role !== "superadmin") {
    return forbidden("Access to this organization is not permitted.");
  }

  const supabase = createAdminClient();

  // Member count
  const { count: memberCount } = await (supabase as any)
    .from("org_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId) as { count: number | null };

  // Token supply (sum of all balances)
  const { data: balanceData } = await (supabase as any)
    .from("token_balances")
    .select("balance, total_earned, total_spent")
    .eq("org_id", orgId) as { data: { balance: number; total_earned: number; total_spent: number }[] | null };

  const totalMinted = (balanceData ?? []).reduce((s, r) => s + (r.total_earned ?? 0), 0);
  const totalSpent  = (balanceData ?? []).reduce((s, r) => s + (r.total_spent  ?? 0), 0);
  const circulation = (balanceData ?? []).reduce((s, r) => s + (r.balance      ?? 0), 0);

  // Actions this month
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const { count: actionsThisMonth } = await (supabase as any)
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("submitted_at", monthStart.toISOString()) as { count: number | null };

  const { count: pendingActions } = await (supabase as any)
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "pending") as { count: number | null };

  // Plan info
  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("plan, member_limit, trial_ends_at, subscription_status")
    .eq("id", orgId)
    .single() as { data: Record<string, unknown> | null };

  return NextResponse.json({
    data: {
      org_id:              orgId,
      member_count:        memberCount ?? 0,
      member_limit:        org?.member_limit ?? 50,
      member_usage_pct:    Math.round(((memberCount ?? 0) / ((org?.member_limit as number) ?? 50)) * 100),
      tokens_minted:       totalMinted,
      tokens_spent:        totalSpent,
      tokens_in_circulation: circulation,
      actions_this_month:  actionsThisMonth ?? 0,
      pending_actions:     pendingActions ?? 0,
      plan:                org?.plan,
      subscription_status: org?.subscription_status,
      trial_ends_at:       org?.trial_ends_at,
    },
    meta: { org_id: orgId },
  });
}
