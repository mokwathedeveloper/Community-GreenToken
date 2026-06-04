import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Rule R-API-05: Plan-gated endpoints MUST check org plan before processing
// Rule: Return 422 with PLAN_LIMIT_EXCEEDED for blocked features

// 5-minute cache — plan limits rarely change and are queried on every protected route
const PLAN_CACHE_TTL_MS = 5 * 60 * 1000;
const planCache = new Map<string, { limits: PlanLimits; expiresAt: number }>();

export type PlanFeature =
  | "analytics"
  | "customToken"
  | "whiteLabel"
  | "apiAccess"
  | "memberLimit";

interface PlanLimits {
  plan: string;
  member_limit: number | null;
  analytics: boolean;
  custom_token: boolean;
  white_label: boolean;
  api_access: boolean;
  price_monthly: number | null;
}

/**
 * Fetch plan limits for an org from the database.
 */
export async function getOrgPlanLimits(orgId: string): Promise<PlanLimits | null> {
  const cached = planCache.get(orgId);
  if (cached && cached.expiresAt > Date.now()) return cached.limits;

  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("plan, subscription_status, member_limit")
    .eq("id", orgId)
    .single() as { data: { plan: string; subscription_status: string; member_limit: number } | null };

  if (!org) return null;

  // Block suspended / past_due orgs from all operations
  if (org.subscription_status === "canceled") return null;

  const { data: limits } = await supabase
    .from("plan_limits")
    .select("*")
    .eq("plan", org.plan)
    .single();

  if (limits) planCache.set(orgId, { limits, expiresAt: Date.now() + PLAN_CACHE_TTL_MS });

  return limits ?? null;
}

/**
 * Check if an org can access a specific feature.
 * Returns null if allowed, or a NextResponse error if blocked.
 */
export async function checkPlanFeature(
  orgId: string,
  feature: PlanFeature
): Promise<NextResponse | null> {
  const limits = await getOrgPlanLimits(orgId);

  if (!limits) {
    return NextResponse.json(
      { error: { code: "SUBSCRIPTION_INACTIVE", message: "Your subscription is inactive. Please update billing." } },
      { status: 403 }
    );
  }

  const featureMap: Record<PlanFeature, boolean> = {
    analytics:   limits.analytics,
    customToken: limits.custom_token,
    whiteLabel:  limits.white_label,
    apiAccess:   limits.api_access,
    memberLimit: true, // checked separately via checkMemberLimit
  };

  if (feature !== "memberLimit" && !featureMap[feature]) {
    const planNames: Record<string, string> = {
      analytics:   "Starter",
      customToken: "Starter",
      whiteLabel:  "Pro",
      apiAccess:   "Pro",
    };
    return NextResponse.json(
      {
        error: {
          code: "PLAN_LIMIT_EXCEEDED",
          message: `Upgrade to ${planNames[feature] ?? "a paid plan"} to access this feature.`,
          upgrade_url: "/pricing",
          current_plan: limits.plan,
          required_plan: planNames[feature] ?? "paid",
        },
      },
      { status: 422 }
    );
  }

  return null; // allowed
}

/** Alias — checkPlanAccess is the public-facing name used in API routes */
export const checkPlanAccess = (
  auth: { orgId: string },
  feature: PlanFeature
): Promise<NextResponse | null> => checkPlanFeature(auth.orgId, feature);

/**
 * Check if adding a new member would exceed the plan limit.
 */
export async function checkMemberLimit(orgId: string): Promise<NextResponse | null> {
  const supabase = createAdminClient();
  const limits = await getOrgPlanLimits(orgId);

  if (!limits || limits.member_limit === null) return null; // unlimited

  const { count } = await supabase
    .from("org_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  if ((count ?? 0) >= limits.member_limit) {
    return NextResponse.json(
      {
        error: {
          code: "MEMBER_LIMIT_REACHED",
          message: `Your plan allows ${limits.member_limit} members. Upgrade to add more.`,
          current: count,
          limit: limits.member_limit,
          upgrade_url: "/pricing",
        },
      },
      { status: 422 }
    );
  }

  return null; // allowed
}
