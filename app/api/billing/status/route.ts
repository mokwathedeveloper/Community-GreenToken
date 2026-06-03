import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/billing/status — current subscription status for org

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();
  const { data } = await (supabase as any)
    .from("organizations")
    .select("plan, subscription_status, trial_ends_at, member_limit, stripe_subscription_id")
    .eq("id", auth.orgId)
    .single() as { data: Record<string, unknown> | null };

  if (!data) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Organization not found." } },
      { status: 404 }
    );
  }

  // Member usage
  const { count: memberCount } = await (supabase as any)
    .from("org_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", auth.orgId);

  return NextResponse.json({
    data: {
      ...data,
      member_count:      memberCount ?? 0,
      is_trialing:       data.subscription_status === "trialing",
      trial_days_left:   data.trial_ends_at
        ? Math.max(0, Math.ceil((new Date(data.trial_ends_at as string).getTime() - Date.now()) / 86400000))
        : null,
    },
    meta: { org_id: auth.orgId },
  });
}
