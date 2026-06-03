import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/tokens/history
 * Returns the authenticated user's GTK token earn + spend history.
 * Combines: verified actions (earn) + redemption_logs (spend) + donations (spend)
 * Query params: ?page=1&limit=20&type=earn|spend
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const { searchParams } = req.nextUrl;
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(50,  Number(searchParams.get("limit") ?? 20));
  const type   = searchParams.get("type");          // "earn" | "spend" | null (all)
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  // Earn events: verified actions
  const earnEvents: Record<string, unknown>[] = [];
  if (!type || type === "earn") {
    const { data: actions } = await (supabase as any)
      .from("actions")
      .select("id, action_type, token_reward, stellar_tx_hash, verified_at")
      .eq("org_id", auth.orgId)
      .eq("user_id", auth.userId)
      .eq("status", "verified")
      .order("verified_at", { ascending: false })
      .limit(limit) as { data: Record<string, unknown>[] | null };

    (actions ?? []).forEach((a) => {
      earnEvents.push({
        id:          a.id,
        type:        "earn",
        event:       a.action_type,
        amount:      a.token_reward,
        tx_hash:     a.stellar_tx_hash,
        timestamp:   a.verified_at,
      });
    });
  }

  // Spend events: redemptions
  const spendEvents: Record<string, unknown>[] = [];
  if (!type || type === "spend") {
    const { data: redemptions } = await (supabase as any)
      .from("redemption_logs")
      .select("id, reward_id, tokens_spent, stellar_tx_hash, redeemed_at, rewards(title)")
      .eq("org_id", auth.orgId)
      .eq("user_id", auth.userId)
      .order("redeemed_at", { ascending: false })
      .limit(limit) as { data: Record<string, unknown>[] | null };

    (redemptions ?? []).forEach((r) => {
      spendEvents.push({
        id:        r.id,
        type:      "spend",
        event:     `Redeemed: ${(r.rewards as any)?.title ?? "Reward"}`,
        amount:    -(r.tokens_spent as number),
        tx_hash:   r.stellar_tx_hash,
        timestamp: r.redeemed_at,
      });
    });

    // Spend events: donations
    const { data: donations } = await (supabase as any)
      .from("donation_records")
      .select("id, project_name, tokens_donated, donated_at")
      .eq("org_id", auth.orgId)
      .eq("donor_user_id", auth.userId)
      .order("donated_at", { ascending: false })
      .limit(limit) as { data: Record<string, unknown>[] | null };

    (donations ?? []).forEach((d) => {
      spendEvents.push({
        id:        d.id,
        type:      "spend",
        event:     `Donated to: ${d.project_name}`,
        amount:    -(d.tokens_donated as number),
        tx_hash:   null,
        timestamp: d.donated_at,
      });
    });
  }

  // Merge and sort by timestamp descending
  const combined = [...earnEvents, ...spendEvents]
    .sort((a, b) =>
      new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime()
    )
    .slice(offset, offset + limit);

  return NextResponse.json({
    data: combined,
    meta: { page, limit, org_id: auth.orgId },
  });
}
