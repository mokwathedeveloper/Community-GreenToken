import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { parseBody, verifyActionSchema } from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/actions/verify
// Rule R-API-02: admin or owner role required
// Spec: stellar_sdk_api_spec.md Section 10

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const parsed = await parseBody(req, verifyActionSchema);
  if ("error" in parsed) return parsed.error;
  const { actionId, tokensToMint } = parsed.data;

  const supabase = createAdminClient();

  // Fetch the action — ensure it belongs to admin's org
  const { data: action, error: fetchErr } = await (supabase as any)
    .from("actions")
    .select("id, org_id, user_id, status")
    .eq("id", actionId)
    .eq("org_id", auth!.orgId)
    .single() as { data: { id: string; org_id: string; user_id: string; status: string } | null; error: unknown };

  if (fetchErr || !action) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Action not found in your organization." } },
      { status: 404 }
    );
  }

  if (action.status !== "pending") {
    return NextResponse.json(
      { error: { code: "ALREADY_PROCESSED", message: `Action is already ${action.status}.` } },
      { status: 409 }
    );
  }

  // Update action to verified
  const { error: updateErr } = await (supabase as any).from("actions").update({ status: "verified", tokens_awarded: tokensToMint, verified_by: auth!.userId })
    .eq("id", actionId);

  if (updateErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to verify action." } },
      { status: 500 }
    );
  }

  // Upsert token balance
  const { data: existing } = await (supabase as any)
    .from("token_balances")
    .select("id, balance, total_earned")
    .eq("org_id", action.org_id)
    .eq("user_id", action.user_id)
    .single() as { data: { id: string; balance: number; total_earned: number } | null };

  if (existing) {
    await (supabase as any)
      .from("token_balances")
      .update({
        balance:      existing.balance      + tokensToMint,
        total_earned: existing.total_earned + tokensToMint,
      })
      .eq("id", existing.id);
  } else {
    await (supabase as any).from("token_balances").insert({
      org_id:       action.org_id,
      user_id:      action.user_id,
      balance:      tokensToMint,
      total_earned: tokensToMint,
      total_spent:  0,
    });
  }

  // TODO Phase 2: ActionRegistry.verify_action(actionId, tokensToMint * 10^7) on Stellar

  return NextResponse.json({
    data: {
      actionId,
      tokensAwarded: tokensToMint,
      message: "Action verified. Tokens awarded.",
    },
    meta: { org_id: auth!.orgId },
  });
}
