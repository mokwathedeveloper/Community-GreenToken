import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";
import { isMpesaConfigured } from "@/lib/payments/mpesa";
import { isStripeConfigured } from "@/lib/payments/stripe-payouts";

// GET /api/admin/withdrawals?status=pending&limit=50&page=1
// Admin view of all org withdrawal requests with member info.

export async function GET(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const limit  = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  // Step 1: fetch withdrawal requests
  let query = (supabase as any)
    .from("withdrawal_requests")
    .select(
      "id, user_id, tokens_amount, cash_amount, currency, method, account_name, account_number, bank_name, " +
      "status, failure_reason, payment_provider, payment_reference, processed_at, created_at, admin_note",
      { count: "exact" }
    )
    .eq("org_id", auth!.orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data: rows, count, error } = await query as {
    data: Record<string, unknown>[] | null;
    count: number | null;
    error: unknown;
  };

  if (error) {
    console.error("[api/admin/withdrawals] DB error:", JSON.stringify(error));
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch withdrawals." } },
      { status: 500 }
    );
  }

  const list = rows ?? [];

  // Step 2: look up member info from public.users
  const userIds = [...new Set(list.map((r: any) => r.user_id as string))];
  let userMap: Record<string, { display_name: string | null; email: string | null }> = {};
  if (userIds.length > 0) {
    const { data: users } = await (supabase as any)
      .from("users")
      .select("id, display_name, email")
      .in("id", userIds) as { data: { id: string; display_name: string | null; email: string | null }[] | null };
    for (const u of users ?? []) userMap[u.id] = { display_name: u.display_name, email: u.email };
  }

  const data = list.map((row: any) => ({
    ...row,
    member: userMap[row.user_id as string] ?? null,
  }));

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0 },
    meta: {
      org_id:            auth!.orgId,
      mpesa_available:   isMpesaConfigured(),
      stripe_available:  isStripeConfigured(),
    },
  });
}
