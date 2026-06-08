/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { CO2_OFFSETS_KG } from "@/lib/certificates/generate";

// GET /api/impact/me
// Returns the authenticated member's personal environmental impact:
//   - Total CO₂ offset (kg) — from certificate records; estimated from actions as fallback
//   - Current action streak (consecutive UTC days ending today or yesterday)
//   - Longest ever streak
//   - Total verified action count

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();

  const [certsRes, actionsRes] = await Promise.all([
    // CO₂ from certificate records (migration 031)
    (supabase as any)
      .from("certificates")
      .select("co2_kg_offset")
      .eq("user_id", auth.userId) as Promise<{
        data: { co2_kg_offset: string | number }[] | null;
        error: { message?: string } | null;
      }>,
    // All verified actions for streak + fallback CO₂ estimate
    (supabase as any)
      .from("actions")
      .select("action_type, verified_at")
      .eq("user_id", auth.userId)
      .eq("status", "verified")
      .not("verified_at", "is", null)
      .order("verified_at", { ascending: false }) as Promise<{
        data: { action_type: string; verified_at: string }[] | null;
      }>,
  ]);

  const actions = actionsRes.data ?? [];
  const certs   = certsRes.data ?? [];

  // ── CO₂ total ────────────────────────────────────────────────────────────
  let co2KgTotal = certs.reduce(
    (s, c) => s + (parseFloat(String(c.co2_kg_offset)) || 0),
    0,
  );
  if (co2KgTotal === 0 && actions.length > 0) {
    // No certificates yet (migration 031 pending) — estimate from action types
    co2KgTotal = actions.reduce(
      (s, a) => s + (CO2_OFFSETS_KG[a.action_type] ?? 3.0),
      0,
    );
  }

  // ── Streak calculation ────────────────────────────────────────────────────
  // Deduplicate by UTC calendar day, then find consecutive runs.
  const dateSet = new Set<string>();
  for (const a of actions) {
    if (a.verified_at) {
      dateSet.add(new Date(a.verified_at).toISOString().slice(0, 10));
    }
  }
  // Sorted descending (newest first)
  const dates = Array.from(dateSet).sort().reverse();

  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let currentStreak = 0;
  if (dates.length > 0 && (dates[0] === today || dates[0] === yesterday)) {
    currentStreak = 1;
    let prev = dates[0];
    for (let i = 1; i < dates.length; i++) {
      const expected = new Date(new Date(prev).getTime() - 86_400_000)
        .toISOString().slice(0, 10);
      if (dates[i] === expected) {
        currentStreak++;
        prev = dates[i];
      } else {
        break;
      }
    }
  }

  let longestStreak = dates.length > 0 ? 1 : 0;
  let runStreak     = 1;
  for (let i = 1; i < dates.length; i++) {
    const expected = new Date(new Date(dates[i - 1]).getTime() - 86_400_000)
      .toISOString().slice(0, 10);
    if (dates[i] === expected) {
      runStreak++;
      if (runStreak > longestStreak) longestStreak = runStreak;
    } else {
      runStreak = 1;
    }
  }

  return NextResponse.json({
    data: {
      co2KgTotal:        parseFloat(co2KgTotal.toFixed(2)),
      currentStreak,
      longestStreak,
      totalActions:      actions.length,
      lastActionDate:    dates[0] ?? null,
    },
  });
}
