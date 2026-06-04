import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { requireOrgAdmin } from "@/lib/middleware/adminGuard";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/actions/pending
 * Org admin: returns the action verification queue for the current org.
 * Only actions with status = 'pending' are returned.
 * Query params: ?page=1&limit=20
 *
 * Rule: Separation of Duties — the member who submitted CANNOT be the verifier.
 * The API enforces this at the verify step (/api/actions/verify).
 */
export async function GET(req: NextRequest) {
  const auth  = await getAuthContext();
  const guard = requireOrgAdmin(auth);
  if (guard) return guard;

  const { searchParams } = req.nextUrl;
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(50,  Number(searchParams.get("limit") ?? 20));
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  // Try with users join first; if the FK relationship isn't registered in Supabase
  // (common in fresh projects), fall back to a plain query without the join.
  let data: Record<string, unknown>[] | null = null;
  let count: number | null = null;

  const joinRes = await (supabase as any)
    .from("actions")
    .select(`
      id, action_type, description, evidence_hash,
      stellar_tx_hash, tokens_awarded, status,
      submitted_at, verified_at,
      users(display_name, email, wallet_address)
    `, { count: "exact" })
    .eq("org_id", auth!.orgId)
    .eq("status", "pending")
    .order("submitted_at", { ascending: true })
    .range(offset, offset + limit - 1) as {
      data: Record<string, unknown>[] | null;
      count: number | null;
      error: unknown;
    };

  if (joinRes.error) {
    // Fallback: query without the users join
    const plainRes = await (supabase as any)
      .from("actions")
      .select("id, action_type, description, evidence_hash, stellar_tx_hash, tokens_awarded, status, submitted_at, verified_at", { count: "exact" })
      .eq("org_id", auth!.orgId)
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .range(offset, offset + limit - 1) as {
        data: Record<string, unknown>[] | null;
        count: number | null;
        error: unknown;
      };

    if (plainRes.error) {
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: "Failed to fetch pending actions." } },
        { status: 500 }
      );
    }
    data  = plainRes.data;
    count = plainRes.count;
  } else {
    data  = joinRes.data;
    count = joinRes.count;
  }

  return NextResponse.json({
    data: data ?? [],
    meta: {
      page, limit,
      total:       count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
      org_id:      auth!.orgId,
    },
  });
}
