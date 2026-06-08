/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/auth/me — current user + org context
// Rule R-API-01: org_id from JWT

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();

  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("id, name, slug, token_name, token_symbol, plan, primary_color, member_limit, trial_ends_at, contract_address")
    .eq("id", auth.orgId)
    .single() as { data: Record<string, unknown> | null };

  const { data: user } = await (supabase as any)
    .from("users")
    .select("id, email, display_name, wallet_address, avatar_url")
    .eq("id", auth.userId)
    .maybeSingle() as { data: Record<string, unknown> | null };

  const { data: membership } = await (supabase as any)
    .from("org_members")
    .select("joined_at")
    .eq("user_id", auth.userId)
    .eq("org_id", auth.orgId)
    .maybeSingle() as { data: { joined_at: string | null } | null };

  return NextResponse.json({
    data: {
      user:    { ...user, userId: auth.userId, email: user?.email ?? auth.email, joined_at: membership?.joined_at ?? null },
      org,
      role:    auth.role,
    },
    meta: { org_id: auth.orgId },
  });
}
