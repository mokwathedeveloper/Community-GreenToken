/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/achievements/me
// Returns the authenticated user's earned achievement badges.
// Computed on-the-fly from existing actions + token_balances — no extra table required.

export const revalidate = 60; // 1-minute cache

interface AchievementDef {
  key:   string;
  label: string;
  icon:  string;
  desc:  string;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { key: "first_action",    label: "First Step",       icon: "🌱", desc: "Submitted your first eco-action" },
  { key: "first_verified",  label: "Green Pioneer",    icon: "✅", desc: "First action verified" },
  { key: "eco_consistent",  label: "Eco Consistent",   icon: "🔋", desc: "5 eco-actions verified" },
  { key: "eco_champion",    label: "Eco Champion",     icon: "🏅", desc: "10 eco-actions verified" },
  { key: "eco_legend",      label: "Eco Legend",       icon: "🏆", desc: "25 eco-actions verified" },
  { key: "tokens_10",       label: "First Harvest",    icon: "🪙", desc: "Earned 10 GTK tokens" },
  { key: "tokens_100",      label: "Token Collector",  icon: "💰", desc: "Earned 100 GTK tokens" },
  { key: "tokens_500",      label: "GTK Legend",       icon: "🌟", desc: "Earned 500 GTK tokens" },
  { key: "tree_planter",    label: "Tree Planter",     icon: "🌳", desc: "Planted 3 trees" },
  { key: "community_hero",  label: "Community Hero",   icon: "🦸", desc: "3 community cleanups" },
];

function resolveEarned(
  totalSubmitted:    number,
  verifiedCount:     number,
  treePlantings:     number,
  communityCleanups: number,
  totalEarned:       number,
): string[] {
  const earned: string[] = [];
  if (totalSubmitted    >= 1)  earned.push("first_action");
  if (verifiedCount     >= 1)  earned.push("first_verified");
  if (verifiedCount     >= 5)  earned.push("eco_consistent");
  if (verifiedCount     >= 10) earned.push("eco_champion");
  if (verifiedCount     >= 25) earned.push("eco_legend");
  if (totalEarned       >= 10) earned.push("tokens_10");
  if (totalEarned       >= 100) earned.push("tokens_100");
  if (totalEarned       >= 500) earned.push("tokens_500");
  if (treePlantings     >= 3)  earned.push("tree_planter");
  if (communityCleanups >= 3)  earned.push("community_hero");
  return earned;
}

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();

  // Fetch all non-rejected actions for this user+org
  const { data: actions, error: actionsErr } = await (supabase as any)
    .from("actions")
    .select("status, type")
    .eq("user_id", auth.userId)
    .eq("org_id",  auth.orgId)
    .neq("status", "rejected") as { data: { status: string; type: string }[] | null; error: unknown };

  if (actionsErr) {
    return NextResponse.json(
      { error: { code: "DB_ERROR", message: "Failed to load achievements." } },
      { status: 500 }
    );
  }

  const actionRows = actions ?? [];

  // Token balance
  const { data: balance } = await (supabase as any)
    .from("token_balances")
    .select("total_earned")
    .eq("user_id", auth.userId)
    .eq("org_id",  auth.orgId)
    .maybeSingle() as { data: { total_earned: number } | null };

  const totalSubmitted    = actionRows.length;
  const verifiedRows      = actionRows.filter(a => a.status === "verified");
  const verifiedCount     = verifiedRows.length;
  const treePlantings     = verifiedRows.filter(a => a.type === "TreePlanting").length;
  const communityCleanups = verifiedRows.filter(a => a.type === "CommunityCleanup").length;
  const totalEarned       = balance?.total_earned ?? 0;

  const earnedKeys = resolveEarned(totalSubmitted, verifiedCount, treePlantings, communityCleanups, totalEarned);
  const earnedSet  = new Set(earnedKeys);

  const badges = ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    earned: earnedSet.has(def.key),
  }));

  return NextResponse.json({
    data: {
      badges,
      earnedCount: earnedKeys.length,
      totalCount:  ACHIEVEMENT_DEFS.length,
    },
  });
}
