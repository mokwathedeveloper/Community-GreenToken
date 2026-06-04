import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, createOrgSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/orgs/create — Onboarding step 1
// Rule R-SAAS-10: slug is permanent after creation
// Rule R-API-04: 201 Created

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const parsed = await parseBody(req, createOrgSchema);
  if ("error" in parsed) return parsed.error;
  const { name, slug, type, tokenName, tokenSymbol, primaryColor } = parsed.data;

  const supabase = createAdminClient();

  // Check slug uniqueness
  const { data: existing } = await (supabase as any)
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle() as { data: { id: string } | null };

  if (existing) {
    return NextResponse.json(
      { error: { code: "SLUG_TAKEN", message: "This subdomain is already taken. Please choose another." } },
      { status: 409 }
    );
  }

  // Create the organization
  const { data: org, error } = await (supabase as any)
    .from("organizations")
    .insert({
      name,
      slug,
      token_name:   tokenName   ?? "GreenToken",
      token_symbol: tokenSymbol ?? "GTK",
      primary_color: primaryColor ?? "#22c55e",
      // Spec: all new orgs start with a 14-day Pro trial (billing_and_subscriptions.md §5)
      // After trial expires (cron job), downgrades to free.
      plan:         "pro",
      subscription_status: "trialing",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      member_limit: 5000, // Pro limit during trial
    })
    .select("id, name, slug, token_name, token_symbol, plan, trial_ends_at")
    .single();

  if (error || !org) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to create organization." } },
      { status: 500 }
    );
  }

  // Create owner membership
  await (supabase as any).from("org_members").insert({
    org_id:  org.id,
    user_id: auth.userId,
    role:    "owner",
  });

  // Update user profile with org_id
  await (supabase as any).from("users").upsert({
    id:     auth.userId,
    org_id: org.id,
    email:  auth.email,
  });

  return NextResponse.json({ data: org, meta: { org_id: org.id } }, { status: 201 });
}
