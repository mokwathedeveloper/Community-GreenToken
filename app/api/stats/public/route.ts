/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { CO2_OFFSETS_KG } from "@/lib/certificates/generate";

// GET /api/stats/public
// No authentication required.
// Returns community-wide aggregate stats for the landing page and Impact page.
// ISR-cached at the Edge: 5-minute TTL, 10-minute stale-while-revalidate.

export const revalidate = 300;

export async function GET() {
  const supabase = createAdminClient();

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now     = Date.now();

  const [actionsRes, balancesRes, certsRes, donationsRes] = await Promise.all([
    (supabase as any)
      .from("actions")
      .select("action_type, verified_at")
      .eq("status", "verified") as Promise<{
        data: { action_type: string; verified_at: string | null }[] | null;
      }>,
    (supabase as any)
      .from("token_balances")
      .select("total_earned") as Promise<{
        data: { total_earned: number }[] | null;
      }>,
    (supabase as any)
      .from("certificates")
      .select("co2_kg_offset") as Promise<{
        data: { co2_kg_offset: string | number }[] | null;
        error: { message?: string } | null;
      }>,
    (supabase as any)
      .from("donation_records")
      .select("tokens_donated") as Promise<{
        data: { tokens_donated: number }[] | null;
      }>,
  ]);

  const actions  = actionsRes.data  ?? [];
  const balances = balancesRes.data ?? [];
  const certs    = (certsRes as { data: { co2_kg_offset: string | number }[] | null }).data ?? [];

  const verifiedActions = actions.length;
  const tokensMinted    = balances.reduce((s, b) => s + (b.total_earned ?? 0), 0);
  const activeMembers   = balances.filter(b => (b.total_earned ?? 0) > 0).length;
  const tokensDonated   = (donationsRes.data ?? []).reduce((s, d) => s + (d.tokens_donated ?? 0), 0);

  // CO₂ total: prefer certificate records; fall back to per-action estimates
  let co2KgTotal = certs.reduce(
    (s, c) => s + (parseFloat(String(c.co2_kg_offset)) || 0),
    0,
  );
  if (co2KgTotal === 0 && actions.length > 0) {
    co2KgTotal = actions.reduce(
      (s, a) => s + (CO2_OFFSETS_KG[a.action_type] ?? 3.0),
      0,
    );
  }

  // Weekly action counts — 8 buckets, each represents one week, oldest→newest
  const weekBuckets: number[] = new Array(8).fill(0);
  for (const a of actions) {
    if (!a.verified_at) continue;
    const diffMs  = now - new Date(a.verified_at).getTime();
    const weekIdx = Math.floor(diffMs / WEEK_MS);
    if (weekIdx >= 0 && weekIdx < 8) {
      weekBuckets[7 - weekIdx] += 1;
    }
  }

  const weeklyChart = weekBuckets.map((count, i) => {
    const d = new Date(now - (7 - i) * WEEK_MS);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: count,
    };
  });

  return NextResponse.json(
    {
      data: {
        verifiedActions,
        tokensMinted,
        activeMembers,
        co2KgTotal:   Math.round(co2KgTotal),
        tokensDonated,
        weeklyChart,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
