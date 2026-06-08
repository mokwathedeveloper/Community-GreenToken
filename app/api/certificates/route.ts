/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/certificates
// Returns the authenticated member's carbon credit certificates, newest first.
// Org admins also see their org's full list when ?scope=org is passed.

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") ?? "0",  10), 0);
  const scope  = searchParams.get("scope"); // "org" for org admin list

  const supabase  = createAdminClient();
  const isAdmin   = auth.role === "admin" || auth.role === "owner" || auth.role === "superadmin";
  const useOrgScope = scope === "org" && isAdmin && auth.orgId;

  let query = (supabase as any)
    .from("certificates")
    .select(
      "id, cert_number, action_type, tokens_earned, co2_kg_offset, stellar_tx_hash, issued_at, user_id",
      { count: "exact" },
    )
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (useOrgScope) {
    query = query.eq("org_id", auth.orgId);
  } else {
    query = query.eq("user_id", auth.userId);
  }

  const { data, error, count } = await query as {
    data: Record<string, unknown>[] | null;
    error: unknown;
    count: number | null;
  };

  if (error) {
    const msg = String((error as any)?.message ?? "");
    // Return empty list if migration 031 hasn't been applied yet
    if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("certificates")) {
      return NextResponse.json({ data: [], meta: { total: 0, limit, offset, migrationPending: true } });
    }
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to fetch certificates." } },
      { status: 500 },
    );
  }

  // Lazy self-heal: if member has no certificates but has verified actions, issue them now.
  // This runs synchronously so the SAME response includes freshly issued certificates.
  // Safe because issueCertificate() is idempotent and never throws.
  if (!useOrgScope && (!data || data.length === 0) && offset === 0) {
    try {
      const { data: verifiedActions } = await (supabase as any)
        .from("actions")
        .select("id")
        .eq("user_id", auth.userId)
        .eq("status", "verified") as { data: { id: string }[] | null };

      if (verifiedActions && verifiedActions.length > 0) {
        const { issueCertificate } = await import("@/lib/certificates/issue");
        for (const action of verifiedActions) {
          await issueCertificate(action.id, supabase);
        }
        // Re-fetch after issuing
        const { data: fresh, count: freshCount } = await (supabase as any)
          .from("certificates")
          .select("id, cert_number, action_type, tokens_earned, co2_kg_offset, stellar_tx_hash, issued_at, user_id", { count: "exact" })
          .eq("user_id", auth.userId)
          .order("issued_at", { ascending: false })
          .range(0, limit - 1) as { data: Record<string, unknown>[] | null; count: number | null };

        return NextResponse.json({
          data:  fresh ?? [],
          meta:  { total: freshCount ?? 0, limit, offset },
        });
      }
    } catch { /* non-critical — fall through to return empty list */ }
  }

  return NextResponse.json({
    data:  data ?? [],
    meta:  { total: count ?? 0, limit, offset },
  });
}
