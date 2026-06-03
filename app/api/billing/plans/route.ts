import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/billing/plans
// Spec: saas/saas_api_endpoints.md — Billing section
// Public endpoint — returns available plans and their limits/prices.
// Used by the pricing page and org setup wizard.

export async function GET() {
  const supabase = createAdminClient();

  const { data: plans, error } = await (supabase as any)
    .from("plan_limits")
    .select("plan, member_limit, analytics, custom_token, white_label, api_access, price_monthly")
    .order("price_monthly", { ascending: true, nullsFirst: false }) as {
      data: Record<string, unknown>[] | null;
      error: unknown;
    };

  if (error || !plans) {
    // Fallback to hardcoded plans if DB query fails
    return NextResponse.json({
      data: [
        { plan: "free",       member_limit: 50,   analytics: false, custom_token: false, white_label: false, api_access: false, price_monthly: 0     },
        { plan: "starter",    member_limit: 500,  analytics: true,  custom_token: true,  white_label: false, api_access: false, price_monthly: 4900  },
        { plan: "pro",        member_limit: 5000, analytics: true,  custom_token: true,  white_label: true,  api_access: true,  price_monthly: 19900 },
        { plan: "enterprise", member_limit: null, analytics: true,  custom_token: true,  white_label: true,  api_access: true,  price_monthly: null  },
      ],
    });
  }

  return NextResponse.json({ data: plans });
}
