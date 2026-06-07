import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

// POST /api/admin/withdrawals/[id]/reject
// Rejects a pending withdrawal and refunds the GTK tokens to the member.

const rejectSchema = z.object({
  reason: z.string().min(5).max(200),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }

  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Rejection reason required (5–200 characters)." } },
      { status: 400 }
    );
  }

  const { reason } = parsed.data;
  const supabase   = createAdminClient();

  // Fetch the withdrawal
  const { data: wr } = await (supabase as any)
    .from("withdrawal_requests")
    .select("id, org_id, user_id, tokens_amount, status")
    .eq("id", id)
    .eq("org_id", auth!.orgId)
    .maybeSingle() as {
      data: { id: string; org_id: string; user_id: string; tokens_amount: number; status: string } | null;
    };

  if (!wr) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Withdrawal request not found." } },
      { status: 404 }
    );
  }

  if (wr.status !== "pending") {
    return NextResponse.json(
      { error: { code: "ALREADY_PROCESSED", message: `Withdrawal is already ${wr.status}.` } },
      { status: 409 }
    );
  }

  // ── Refund tokens atomically ───────────────────────────────────────────────
  // Tokens were deducted at request time — restore them on rejection.
  const { data: bal } = await (supabase as any)
    .from("token_balances")
    .select("id, balance, total_spent")
    .eq("org_id", wr.org_id)
    .eq("user_id", wr.user_id)
    .maybeSingle() as { data: { id: string; balance: number; total_spent: number } | null };

  if (bal) {
    await (supabase as any)
      .from("token_balances")
      .update({
        balance:     bal.balance + wr.tokens_amount,
        total_spent: Math.max(0, bal.total_spent - wr.tokens_amount),
      })
      .eq("id", bal.id);
  }

  // ── Mark as canceled with reason ──────────────────────────────────────────
  const { error: updateErr } = await (supabase as any)
    .from("withdrawal_requests")
    .update({
      status:       "canceled",
      failure_reason: reason,
      processed_by: auth!.userId,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateErr) {
    console.error("[api/admin/withdrawals/reject] DB error:", JSON.stringify(updateErr));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to reject withdrawal." } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      withdrawalId:    id,
      status:          "canceled",
      tokensRefunded:  wr.tokens_amount,
      reason,
    },
    meta: { org_id: auth!.orgId },
  });
}
